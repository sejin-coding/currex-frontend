import React from "react";
import { useLocation } from "react-router-dom"; // useLocation 임포트
import styled from "styled-components";
import NavBar from "../NavBar/NavBar";

function Layout({ children }) {
  const location = useLocation(); // 현재 경로 가져오기
  const showNavBar = ["/list", "/donate", "/chatlist", "/mypage", "/mysell", "/myexchange"].includes(location.pathname); 

  return (
    <Container>
      {children}
      {showNavBar && <NavBar active={location.pathname.slice(1)} />} {/* NavBar 조건부 렌더링 */}
    </Container>
  );
}

export default Layout;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
