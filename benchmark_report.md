# 📊 Benchmark Report

## Vehicle Speed Monitoring Dashboard

---

# 1. Test Environment

| Item | Value |
|------|------|
| Operating System | Windows 10 |
| Browser | Google Chrome |
| Backend | Flask |
| Frontend | HTML5, CSS3, JavaScript |
| Python | Python 3.x |
| Communication | REST API |
| Test Date | 18/07/2026 |

---

# 2. API Performance

The dashboard communicates with the backend through the `/api/distance` REST API.

| Metric | Result |
|---------|---------|
| HTTP Status | 200 OK |
| Minimum Response Time | 7 ms |
| Maximum Response Time | 24 ms |
| Average Response Time | ~14 ms |

**Observation**

- API responses are stable.
- No failed requests were detected.
- Response latency is suitable for real-time applications.

---

# 3. Dashboard Performance

| Metric | Result |
|---------|---------|
| Dashboard Update Interval | 500 ms |
| Simulation Frequency | 2 updates/second |
| Data Format | JSON |
| Communication Protocol | HTTP REST API |

**Observation**

The dashboard updates smoothly every 500 milliseconds without noticeable lag.

---

# 4. Simulation Performance

| Item | Value |
|------|------|
| Speed Range | 0.05 – 0.10 m/s |
| Simulation Mode | Continuous |
| History Storage | Last 500 samples |
| Data Source | Internal Software Simulator |

---

# 5. Resource Usage

| Resource | Result |
|----------|---------|
| CPU Usage | 0.1% – 0.4% |
| Memory Usage | 11.1 MB |

**Observation**

The application consumes very little CPU and memory, making it suitable for continuous monitoring on standard computers.

---

# 6. Functional Testing

| Function | Status |
|----------|--------|
| Dashboard Loading | ✅ Pass |
| REST API | ✅ Pass |
| Speed Simulation | ✅ Pass |
| Real-time Update | ✅ Pass |
| Average Speed Calculation | ✅ Pass |
| Maximum Speed Tracking | ✅ Pass |
| Direction Detection | ✅ Pass |

---

# 7. Conclusion

The Vehicle Speed Monitoring Dashboard performs reliably during testing.

Key results include:

- Stable REST API communication.
- Response time between **7–24 ms**.
- Dashboard updates every **500 ms**.
- Low CPU usage (**0.1%–0.4%**).
- Low memory usage (**11.1 MB**).
- Continuous real-time simulation without interruptions.

Overall, the application demonstrates good performance and is suitable as a prototype for real-time vehicle speed monitoring systems.

---

# 8. Future Optimization

Possible future improvements include:

- Integrating real HC-SR04 sensor data.
- Using WebSocket instead of polling for lower latency.
- Storing historical data in a database.
- Exporting reports to CSV or Excel.
- Deploying the application to a cloud server.
- Supporting multiple vehicles simultaneously.
