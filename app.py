from flask import Flask, jsonify, request, render_template
from collections import deque
import time
import threading
import math
import random

app = Flask(__name__, static_folder='static', template_folder='templates')

MIN_SPEED_M_S = 0.05
MAX_SPEED_M_S = 0.10

# In-memory storage for demo; replace with persistent store for production
history = deque(maxlen=500)
last = {'distance': None, 'ts': None, 'speed_m_s': None, 'speed_kmh': None, 'direction': None}


class Simulator:
    """Background simulator that generates realistic vehicle speed values."""
    def __init__(self):
        self._thread = None
        self._running = threading.Event()
        self._lock = threading.Lock()
        self.current_speed = None  # m/s
        self.current_distance = 150.0  # cm, arbitrary starting distance

    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._running.set()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self):
        self._running.clear()

    def _run(self):
        # Simulation loop: update every 0.5s
        # Keep the simulated speed between 0.05 and 0.10 m/s.
        if self.current_speed is None:
            self.current_speed = 0.075
        last_time = time.time()
        phase = random.random() * 2 * math.pi
        while self._running.is_set():
            t = time.time()
            dt = t - last_time
            last_time = t

            # Target follows a slow sinusoid between 0.05 and 0.10 m/s.
            target = 0.075 + 0.025 * math.sin(0.15 * t + phase)
            # smooth approach to target to avoid jumps
            alpha = 0.08  # smoothing factor for speed changes
            noise = (random.random() - 0.5) * 0.003  # small noise
            with self._lock:
                # adjust current speed towards target with small steps
                self.current_speed += (target - self.current_speed) * alpha + noise
                self.current_speed = max(MIN_SPEED_M_S, min(MAX_SPEED_M_S, self.current_speed))

                # update distance as a soft inverse function of speed to simulate relative obstacle
                # faster -> distance may increase/decrease smoothly
                self.current_distance += (math.sin(0.5 * t + phase) * 2.0 + (random.random() - 0.5) * 1.0)
                if self.current_distance < 5.0:
                    self.current_distance = 5.0

                speed_m_s = self.current_speed
                speed_kmh = speed_m_s * 3.6
                ts = t

                # determine direction from small change in speed
                # compare to previous last speed if available
                prev_speed = last.get('speed_m_s')
                direction = 'Cruising'
                if prev_speed is not None:
                    delta = speed_m_s - prev_speed
                    if delta > 0.0005:
                        direction = 'Accelerating'
                    elif delta < -0.0005:
                        direction = 'Decelerating'
                    else:
                        direction = 'Cruising'

                # update shared last and history
                last['distance'] = float(self.current_distance)
                last['ts'] = ts
                last['speed_m_s'] = float(speed_m_s)
                last['speed_kmh'] = float(speed_kmh)
                last['direction'] = direction
                history.append({'distance': float(self.current_distance), 'ts': ts, 'speed_m_s': float(speed_m_s), 'speed_kmh': float(speed_kmh), 'direction': direction})

            # sleep until next tick (aim for 0.5s)
            time.sleep(0.5)


sim = Simulator()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/distance', methods=['GET', 'POST'])
def api_distance():
    if request.method == 'POST':
        data = request.get_json() or {}

        # Control commands for server-side simulation
        action = data.get('action') or data.get('cmd') or None
        if action in ('start_sim', 'start', 'start_simulation'):
            sim.start()
            return jsonify({'status': 'sim_started'})
        if action in ('stop_sim', 'stop', 'stop_simulation'):
            sim.stop()
            return jsonify({'status': 'sim_stopped'})

        # Backward-compatible: accept posted distance from client
        if 'distance' not in data:
            return jsonify({'error': 'distance required or action required'}), 400
        try:
            d = float(data['distance'])
        except Exception:
            return jsonify({'error': 'invalid distance'}), 400
        ts = time.time()
        # compute speed from previous reading (distance in cm -> meters)
        speed_m_s = None
        speed_kmh = None
        direction = None
        prev_d = last.get('distance')
        prev_ts = last.get('ts')
        if prev_d is not None and prev_ts is not None and ts > prev_ts:
            delta_m = (prev_d - d) / 100.0
            dt = ts - prev_ts
            if dt > 0:
                speed_m_s = abs(delta_m) / dt
                speed_kmh = speed_m_s * 3.6
                if delta_m > 0:
                    direction = 'approaching'
                elif delta_m < 0:
                    direction = 'receding'
                else:
                    direction = 'stationary'

        last['distance'] = d
        last['ts'] = ts
        last['speed_m_s'] = speed_m_s
        last['speed_kmh'] = speed_kmh
        last['direction'] = direction
        history.append({'distance': d, 'ts': ts, 'speed_m_s': speed_m_s, 'speed_kmh': speed_kmh, 'direction': direction})
        return jsonify({'status': 'ok'})
    else:
        # compute avg and max from recorded speeds in history
        speeds = [h.get('speed_kmh') for h in history if h.get('speed_kmh') is not None]
        avg_speed = None
        max_speed = None
        avg_speed_m_s = None
        max_speed_m_s = None
        if speeds:
            # ensure numeric
            numeric = [float(s) for s in speeds if isinstance(s, (int, float)) or (isinstance(s, str) and s.replace('.', '', 1).isdigit())]
            if numeric:
                avg_speed = sum(numeric) / len(numeric)
                max_speed = max(numeric)
                avg_speed_m_s = avg_speed / 3.6
                max_speed_m_s = max_speed / 3.6

        return jsonify({
            'distance': last['distance'],
            'ts': last['ts'],
            'speed_m_s': last['speed_m_s'],
            'speed_kmh': last['speed_kmh'],
            'direction': last['direction'],
            'history': list(history),
            'avg_speed_kmh': avg_speed,
            'max_speed_kmh': max_speed,
            'avg_speed_m_s': avg_speed_m_s,
            'max_speed_m_s': max_speed_m_s
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
