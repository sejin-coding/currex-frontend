import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../utils/api"; 
import dropdown from "../../images/dropdown.svg";

function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("전체"); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const dropdownRef = useRef(null);

  const statusColors = {
    "판매중": "#1E62C1",
    "거래중": "#0BB770",
    "거래완료": "#1F2024"
  };

  // 채팅 목록 불러오기
  useEffect(() => {
    const fetchChatList = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const response = await api.get("/api/trade/list", { withCredentials: true });

        //console.log("채팅 목록 불러오기 성공:", response.data);
        setChats(response.data); // 불러온 데이터 저장
      } catch (err) {
        console.error("채팅 목록 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, [navigate]);

  // 선택된 상태에 따라 필터링
  const filteredChats = selectedStatus === "전체"
    ? chats
    : chats.filter(chat => chat.status === selectedStatus);


  // 실시간 환율 가져오기
useEffect(() => {
  const fetchExchangeRates = async () => {
    if (chats.length === 0) return; // 채팅 목록이 없으면 실행 안 함

    const uniqueCurrencies = [...new Set(chats.map((chat) => chat.currency).filter(Boolean))]; 
    const rates = {};

    try {
      await Promise.all(
        uniqueCurrencies.map(async (currency) => {
          const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
          rates[currency] = response.data.rates.KRW;
        })
      );
      setExchangeRates(rates);
    } catch (error) {
      console.error("환율 데이터 불러오기 오류:", error);
    }
  };

  fetchExchangeRates();
}, [chats]); 

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


  return (
    <Container>
      <Header>
        <Title>채팅 목록</Title>
        <FilterContainer ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
          {selectedStatus}
          <DropdownIcon src={dropdown} alt="드롭다운" />
          {showDropdown && (
            <DropdownMenu>
              {["전체", "판매중", "거래중", "거래완료"].map((status) => (
                <DropdownItem key={status} onClick={() => {
                  setSelectedStatus(status);
                  setShowDropdown(false);
                }}>
                  {status}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </FilterContainer>
      </Header>

      {loading ? (
        <LoadingMessage>채팅 목록을 불러오는 중...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>채팅 목록을 불러오지 못했습니다.</ErrorMessage>
      ) : filteredChats.length === 0 ? (
        <NoDataMessage>채팅 내역이 없습니다.</NoDataMessage>
      ) : (
        <ChatListContainer>
          {filteredChats.map((chat) => (
            <ChatItem key={chat.chatRoomId} onClick={() => navigate(`/chat/${chat.chatRoomId}`)}>
              <Avatar src={chat.opponentProfileImg || "https://via.placeholder.com/40"} alt={`${chat.opponentName} avatar`} />
              <ChatInfo>
              <ChatHeader>
                <NameContainer>
                  <Name>{chat.opponentName}</Name>
                </NameContainer>
                <Status style={{ backgroundColor: statusColors[chat.status] || "#000" }}>
                  {chat.status}
                </Status>
              </ChatHeader>
                <PriceAndFlags>
                  <PriceContainer>
                    <Amount>
                      {chat.amount ? `${chat.amount} ${chat.currency}` : "금액 정보 없음"}
                    </Amount>
                    <ConvertedPrice>
                      {exchangeRates[chat.currency]
                        ? `${Math.round(chat.amount * exchangeRates[chat.currency])} 원`
                        : "환율 정보 없음"}
                    </ConvertedPrice>
                  </PriceContainer>
                </PriceAndFlags>

              </ChatInfo>
            </ChatItem>
          ))}
        </ChatListContainer>
      )}
    </Container>
  );
}

export default ChatList;

const Container = styled.div`
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  background: white;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 16px 21px;
  border-bottom: 1px solid #f7f7f7;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin-top: 10px;
  flex-grow: 1;
  text-align: center;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #1f2024;
  background: #f7f7f7;
  border-radius: 1000px;
  cursor: pointer;
  position: relative;
  margin-left:250px;
`;

const DropdownIcon = styled.img`
  width: 10px;
  height: 10px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0; 
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
  min-width: 100px;
  font-weight: 300; 
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  color: #1f2024;
  text-align: left;
  font-weight: 300; 

  &:hover {
    background: #f7f7f7;
  }
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px;
  width: 100%; 
  max-width: 375px; 
  margin: 0 auto; 
`;


const ChatItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 21px;
  border-bottom: 1px solid #f1f1f1; 
  cursor: pointer;

  &:hover {
    background: #f9f9f9;
  }
`;

const Avatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid #f1f1f1;
  margin-left: -10px;
`;

const ChatInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between; 
  align-items: center;
  width: 100%;
  flex-wrap: nowrap;
`;

const NameContainer = styled.div`
  flex-grow: 1; 
  min-width: 0;
  overflow: hidden;
`;

const Name = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1f2024;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Status = styled.div`
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 300;
  color: white;
  border-radius: 10px;
  flex-shrink: 0; 
  margin-left: auto; 
  margin-right: -10px;
`;

const PriceAndFlags = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 0;
  gap: 16px;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
`;

const Amount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2024;
`;

const ConvertedPrice = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #666666;
  margin-left: 10px;
  margin-top:5px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: red;
  margin-top: 20px;
`;

const NoDataMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #888;
`;

