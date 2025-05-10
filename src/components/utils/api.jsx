import axios from "axios";

// 기본 Axios 인스턴스 생성
const api = axios.create({
  baseURL: "https://15.165.1.49:5000",  // 백엔드 주소
  withCredentials: true,  // 쿠키 전달 (refreshToken을 위한 설정)
});

// 요청 인터셉터: 요청 전에 accessToken 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 발생 시 자동으로 /refresh 요청 후 재시도
api.interceptors.response.use(
  (response) => response, // 정상 응답 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // accessToken이 만료되어 401 오류 발생 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        // /auth/refresh 요청하여 새로운 accessToken 발급
        const refreshResponse = await axios.post(
          "https://currex.kro.kr/api/auth/refresh",
          {},
          { withCredentials: true } // 쿠키 전달 (refreshToken 포함)
        );

        // 2새로운 accessToken 저장
        const newAccessToken = refreshResponse.data.accessToken;
        sessionStorage.setItem("accessToken", newAccessToken);

        // 원래 요청의 Authorization 헤더 갱신 후 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // 원래 요청 다시 실행
      } catch (refreshError) {
        console.error("Refresh Token 만료 또는 실패:", refreshError);
        sessionStorage.removeItem("accessToken"); // 토큰 삭제
        window.location.href = "/login"; // 로그인 페이지로 이동
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
