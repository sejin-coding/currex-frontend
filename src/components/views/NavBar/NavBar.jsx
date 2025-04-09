import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import homeicon from "../../images/NavBar/homeicon.svg";
import homeiconActive from "../../images/NavBar/homeicon-active.svg"; // 빨간색 아이콘 추가
import donateicon from "../../images/NavBar/donateicon.svg";
import donateiconActive from "../../images/NavBar/donateicon-active.svg";
import cameraicon from "../../images/NavBar/cameraicon.svg";
import cameraiconActive from "../../images/NavBar/cameraicon-active.svg";
import chaticon from "../../images/NavBar/chaticon.svg";
import chaticonActive from "../../images/NavBar/chaticon-active.svg";
import usericon from "../../images/NavBar/usericon.svg";
import usericonActive from "../../images/NavBar/usericon-active.svg";

function NavBar() {
  const [active, setActive] = useState("list");
  const navigate = useNavigate();

  const handleClick = (tab, path) => {
    setActive(tab);
    navigate(path);
  };

  return (
    <Container>
      <NavItem
        isActive={active === "list"}
        onClick={() => handleClick("list", "/list")}
      >
        <NavIcon
          src={active === "list" ? homeiconActive : homeicon}
          alt="목록"
        />
        <NavText isActive={active === "list"}>목록</NavText>
      </NavItem>
      <NavItem
        isActive={active === "donate"}
        onClick={() => handleClick("donate", "/donate")}
      >
        <NavIcon
          src={active === "donate" ? donateiconActive : donateicon}
          alt="기부하기"
        />
        <NavText isActive={active === "donate"}>기부하기</NavText>
      </NavItem>
      <NavItem
        isActive={active === "camera"}
        onClick={() => handleClick("camera", "/detect")}
      >
        <NavIcon
          src={active === "camera" ? cameraiconActive : cameraicon}
          alt="카메라"
        />
        <NavText isActive={active === "camera"}>카메라</NavText>
      </NavItem>
      <NavItem
        isActive={active === "chatlist"}
        onClick={() => handleClick("chatlist", "/chatlist")}
      >
        <NavIcon
          src={active === "chatlist" ? chaticonActive : chaticon}
          alt="채팅하기"
        />
        <NavText isActive={active === "chatlist"}>채팅하기</NavText>
      </NavItem>
      <NavItem
        isActive={active === "mypage"}
        onClick={() => handleClick("mypage", "/mypage")}
      >
        <NavIcon
          src={active === "mypage" ? usericonActive : usericon}
          alt="내 정보"
        />
        <NavText isActive={active === "mypage"}>내 정보</NavText>
      </NavItem>
    </Container>
  );
}

export default NavBar;

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 375px;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #f7f7f7;
  padding: 12px 0;
  z-index: 10;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
`;

const NavText = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? "#CA2F28" : "#C8C8C8")};
`;

const NavIcon = styled.img`
  width: 24px;
  height: 24px;
`;
