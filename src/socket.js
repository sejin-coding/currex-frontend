import { io } from "socket.io-client";

// 🔥 서버 주소를 넣어서 소켓 연결 (백엔드 서버 주소로 변경)
const socket = io("http://currex.kro.kr:5000", {
  withCredentials: true,  // 쿠키 인증 필요하면 추가
  transports: ["websocket"], // WebSocket 우선 사용
});

export default socket;