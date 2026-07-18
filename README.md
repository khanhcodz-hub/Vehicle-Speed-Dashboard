# 🚗 Vehicle Speed Monitoring Dashboard

Dashboard giám sát tốc độ xe theo thời gian thực, xây dựng bằng **Python Flask**, **HTML**, **CSS** và **JavaScript**.  
Dự án mô phỏng dữ liệu tốc độ xe và hiển thị chúng trên giao diện web trực quan, có thể tương tác.

---

## 📖 Project Overview

Đây là dự án thực hành nhằm tìm hiểu:

- Flask Web Framework
- REST API
- Phát triển giao diện với HTML, CSS và JavaScript
- Trực quan hóa dữ liệu thời gian thực
- Thiết kế giao diện dashboard
- Quy trình làm việc với Git & GitHub

Dashboard mô phỏng chuyển động của xe và liên tục cập nhật tốc độ hiện tại, tốc độ trung bình, tốc độ cao nhất, trạng thái chuyển động và dữ liệu lịch sử.

---

# 🎯 Objectives

Mục tiêu của dự án:

- Xây dựng ứng dụng web với Flask.
- Tìm hiểu cách Frontend giao tiếp với Backend qua REST API.
- Mô phỏng dữ liệu tốc độ xe.
- Hiển thị thông tin thời gian thực trên dashboard tương tác.
- Thực hành tổ chức dự án và quy trình phát triển phần mềm.

---

# ✨ Features

-  Mô phỏng tốc độ xe trong khoảng  0,05-0,1m/s
-  Biểu đồ tốc độ theo thời gian thực
-  Hiển thị tốc độ hiện tại
-  Tính tốc độ trung bình
-  Theo dõi tốc độ cao nhất
-  Nhận biết trạng thái tăng tốc, giảm tốc hoặc chạy ổn định
-  Bắt đầu mô phỏng
-  Dừng mô phỏng
-  Giao tiếp qua REST API
-  Dashboard hiện đại, responsive
-  Phóng to/thu nhỏ biểu đồ


# 🛠 Technologies Used

Backend

- Python 3
- Flask

Frontend

- HTML5
- CSS3
- JavaScript (ES6)

Libraries & Services

- Chart.js
- chartjs-plugin-zoom
- Font Awesome
- Google Fonts (Inter)

---

# 📁 Project Structure

```text
firtpython
│
├── app.py
├── requirements.txt
├── README.md

── templates
│   └── index.html
│
└── static
    ├── app.js
    ├── style.css
    ├── car.svg
    └── favicon.svg
```

---

# ⚙️ Installation

Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/Vehicle-Speed-Dashboard.git
```

Move into project

```bash
cd Vehicle-Speed-Dashboard
```

Install dependencies

```bash
python -m pip install -r requirements.txt
```

Run the application

```bash
python app.py
```

Open browser

```
http://127.0.0.1:5000
```

---

# 🏗 System Architecture

```text
Vehicle Speed Simulator
           │
           ▼
      Flask Backend
           │
     REST API (/api/distance)
           │
           ▼
     JavaScript Frontend
           │
           ▼
      Dashboard UI
           │
           ▼
      Speed Chart
```

---

# 🔄 API

## GET /api/distance

Trả về dữ liệu xe mô phỏng mới nhất, bao gồm lịch sử đo và các chỉ số tổng hợp.

Example response

```json
{
  "distance": 152.8,
  "speed_kmh": 31.4,
  "speed_m_s": 8.72,
  "direction": "Accelerating",
  "avg_speed_kmh": 28.6,
  "max_speed_kmh": 39.5,
  "history": []
}
```

---

## POST /api/distance

Start simulation

```json
{
  "action": "start"
}
```

Stop simulation

```json
{
  "action": "stop"
}
```

Bạn cũng có thể gửi dữ liệu khoảng cách thủ công để backend tính tốc độ từ các lần đo liên tiếp:

```json
{
  "distance": 120
}
```

---

#  Dashboard Information

Dashboard hiển thị:

- Tốc độ hiện tại
- Tốc độ trung bình
- Tốc độ cao nhất
- Trạng thái chuyển động
- Thời điểm cập nhật gần nhất
- Biểu đồ tốc độ thời gian thực
- Trạng thái kết nối và hoạt động hệ thống

---

#  Future Improvements

Các phiên bản sau có thể bổ sung:

- Tích hợp ESP32
- Cảm biến siêu âm HC-SR04
- Thu thập dữ liệu xe thực tế
- Lưu trữ cơ sở dữ liệu
- Xác thực người dùng
- Xuất báo cáo CSV
- Ứng dụng di động
- Dự đoán tốc độ bằng AI

---

#  Author

**Bùi Nhật Khánh**

Faculty of Electronics and Telecommunications  
Hanoi University of Industry (HaUI)

---

#  License

Dự án được phát triển cho mục đích học tập.
