import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../../images/currexlogo.svg";
import kakaoIcon from "../../images/kakaoicon.svg";
import googleIcon from "../../images/googleicon.svg";
import api from "../../utils/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState(null); 
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get("token"); 
    const userId = urlParams.get("userId");

    if (accessToken && userId) {
      
      sessionStorage.setItem("accessToken", accessToken); // 세션스토리지에 저장 (브라우저 닫으면 삭제)
      sessionStorage.setItem("userId", userId);
      setCurrentUserId(userId); 
      navigate("/list"); 
    } else {
      console.log("accessToken 없음, 로그인 필요");
    }
  }, [location, navigate]);

  const clearStorageBeforeLogin = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };
  
  // 로그인 버튼을 눌렀을 때 실행
  const handleGoogleLogin = () => {
    clearStorageBeforeLogin();
    window.location.href = "https://currex.kro.kr:5000/api/auth/google";
  };
  
  const handleKakaoLogin = () => {
    clearStorageBeforeLogin();
    window.location.href = "https://15.165.1.49:5000/api/auth/kakao";
  };

  //다른 탭에서도 로그인 변경 적용
  useEffect(() => {
    const updateUserId = () => {
      const storedUserId = sessionStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    };

    window.addEventListener("storage", updateUserId);

    return () => {
      window.removeEventListener("storage", updateUserId);
    };
  }, []);


  return (
    <Container>
      <LogoContainer>
        <Logo src={logo} alt="Logo" />
      </LogoContainer>
      <SocialLoginContainer>
        <LoginText>Sign up with Social Networks</LoginText>
        <IconsWrapper>
          <SocialIcon src={kakaoIcon} alt="Kakao Login" onClick={handleKakaoLogin} />
          <SocialIcon src={googleIcon} alt="Google Login" onClick={handleGoogleLogin} />
        </IconsWrapper>
      </SocialLoginContainer>
    </Container>
  );
}

export default Login;

// 스타일 코드 생략

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #1F1F24;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  font-family: "Pretendard", sans-serif;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  width: 100%; 
  margin-bottom: 40px;
`;

const Logo = styled.img`
  max-width: 80%;  
  height: auto;
  margin-bottom: 10px;
  margin-left:10px;
`;


const SocialLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginText = styled.p`
  font-size: 14px;
  color: #c4c4c4;
  margin-bottom: 20px;
`;

const IconsWrapper = styled.div`
  display: flex;
  gap: 20px;
`;

const SocialIcon = styled.img`
  width: 100%;
  height: 100%;
  cursor: pointer;
`;
