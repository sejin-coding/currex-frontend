import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../../utils/api";
import infoicon from "../../images/infoicon.svg";
import backarrow from "../../images/backarrow.svg";
import dropdown from "../../images/dropdown.svg";
import sendicon from "../../images/sendicon.svg";
import PlaceModal from "./PlaceModal";
import axios from "axios";

const socket = io("http://currex.kro.kr:5000", { withCredentials: true });

function Chat() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chat, setChat] = useState(null);
  const [isSeller, setIsSeller] = useState(false); // 판매자인지 여부 저장
  const [sellId, setSellId] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const currentUserId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");

  //  채팅방 입장 (
  useEffect(() => {
    if (!chatRoomId) return;

    socket.emit("joinRoom", { chatRoomId });

    return () => {
      socket.off("joinRoom");
    };
  }, [chatRoomId]);

  //채팅방, 상대정보, 판매정보 가져오기
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await api.get(`/api/trade/list`, {
          withCredentials: true,
        });
        const chatRoom = response.data.find(
          (chat) => chat.chatRoomId === chatRoomId
        );

        if (!chatRoom) {
          console.error("채팅방 정보를 찾을 수 없습니다.");
          return;
        }

        if (!chatRoom.sellId) {
          console.error("sellId 없음, API에서 가져와야 함.");
          return;
        }

        //console.log("불러온 sellId:", chatRoom.sellId);
        setSellId(chatRoom.sellId);

        // 판매 정보 가져오기
        const postResponse = await api.get(
          `/api/sell/sellDescription/${chatRoom.sellId}`
        );
        setChat((prev) => ({
          ...prev,
          sellInfo: {
            ...postResponse.data,
            image: postResponse.data.images?.[0], // 첫 번째 이미지만 저장
          },
        }));
        setStatus(postResponse.data.status);

        // 판매자와 현재 사용자 비교
        if (postResponse.data.sellerId === currentUserId) {
          setIsSeller(true);
        } else {
          setIsSeller(false);
        }

        //상대방 정보 가져오기 추가
        const opponentResponse = await api.get(
          `/api/chat/opponentInfo?chatRoomId=${chatRoomId}`
        );
        setChat((prev) => ({
          ...prev,
          opponentName: opponentResponse.data.nickname || "알 수 없는 사용자",
          opponentProfileImg:
            opponentResponse.data.profile_img ||
            "https://via.placeholder.com/40",
        }));
      } catch (error) {
        console.error("채팅방 정보 불러오기 오류:", error);
      }
    };

    fetchChatData();
  }, [chatRoomId, currentUserId]);

  //메시지받기
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      console.log("받은 메시지:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    console.log("현재 messages 상태:", messages);
  }, [messages]);

  // 기존 메시지 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/api/chat/getMessage?chatRoomId=${chatRoomId}`
        );
        console.log("서버에서 가져온 메시지 목록:", response.data);
        setMessages(response.data || []);
      } catch (error) {
        console.error("메시지 불러오기 오류:", error);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      chatRoomId,
      senderId: currentUserId,
      message: newMessage,
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  // 거래 상태 변경
  const changeStatus = async (newStatus) => {
    if (!isSeller) {
      console.error("거래 상태 변경은 판매자만 가능합니다.");
      return;
    }

    try {
      if (!sellId) {
        console.error("오류: sellId가 정의되지 않았습니다.");
        return;
      }

      await api.patch(`/api/sell/${sellId}/status`, { status: newStatus });

      // 상태 업데이트를 위해 다시 DB에서 불러오기
      const updatedSell = await api.get(`/api/sell/sellDescription/${sellId}`);
      setStatus(updatedSell.data.status);
      setShowOptions(false);
    } catch (error) {
      console.error("거래 상태 변경 오류:", error);
    }
  };

  // 거래 장소 추천
  const renderMessage = (msg) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; //URL 찾는 정규식

    return (
      <Message sender={msg.senderId === currentUserId ? "me" : "other"}>
        {msg.message.split(urlRegex).map((part, index) =>
          part.match(urlRegex) ? (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#F7F7F7",
                textDecoration: "underline",
              }}
            >
              [지도 보기]
            </a>
          ) : (
            part
          )
        )}
      </Message>
    );
  };

  const handleSendPlace = (selectedPlace) => {
    if (!selectedPlace) {
      console.error("장소 데이터가 없습니다!");
      return;
    }

    // 카카오 동적 지도 링크 URL 생성
    const dynamicMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
      selectedPlace.name
    )},${selectedPlace.latitude},${selectedPlace.longitude}`;

    console.log("동적 지도 URL:", dynamicMapUrl);

    const placeMessage = {
      chatRoomId,
      senderId: currentUserId,
      message: `거래 장소 추천: ${selectedPlace.name}\n${dynamicMapUrl}`, // 🔥 URL을 message에 포함
      isPlace: true,
    };

    // 소켓을 통해 서버로 메시지 전송
    socket.emit("sendMessage", placeMessage);

    setShowModal(false);
  };

  // 실시간 환율 가져오기
  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (!chat || !chat.sellInfo || !chat.sellInfo.currency) return; // 🔥 방어 코드 추가

      const currency = chat.sellInfo.currency;
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${currency}`
        );
        setExchangeRates((prevRates) => ({
          ...prevRates,
          [currency]: response.data.rates.KRW,
        }));
      } catch (error) {
        console.error("환율 데이터 불러오기 오류:", error);
      }
    };

    fetchExchangeRates();
  }, [chat]);

  return (
    <Container>
      {/* 헤더 - 판매자 정보 추가 */}
      <Header>
        <BackButton
          src={backarrow}
          alt="뒤로가기"
          onClick={() => navigate(-1)}
        />

        {chat ? (
          <SellerInfo>
            <ProfileImage
              src={chat.opponentProfileImg || "https://via.placeholder.com/40"}
              alt="opponent"
            />
            <SellerName>{chat.opponentName || "알 수 없는 사용자"}</SellerName>
          </SellerInfo>
        ) : (
          <SellerInfo>
            <ProfileImage src="https://via.placeholder.com/40" alt="seller" />
            <SellerName>로딩 중...</SellerName>
          </SellerInfo>
        )}

        {/* 판매자인 경우에만 거래 상태 변경 가능능*/}
        <StatusContainer>
          {isSeller ? ( //  판매자인 경우에만 버튼 활성화
            <>
              <StatusButton
                onClick={() => setShowOptions(!showOptions)}
                disabled={status === "거래완료"}
              >
                <StatusText>{status}</StatusText>
                {status !== "거래완료" && <StatusDropdown src={dropdown} />}
              </StatusButton>

              {showOptions && (
                <DropdownMenu>
                  {["판매중", "거래중", "거래완료"].map((s) => (
                    <DropdownItem key={s} onClick={() => changeStatus(s)}>
                      {s}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </>
          ) : (
            <StatusText>{status}</StatusText> // 구매자는 상태 변경 버튼 없이 보기만 가능
          )}
        </StatusContainer>
      </Header>

      {/* 가격 및 환율 정보 표시 */}
      <ProductInfo onClick={() => navigate(`/sell/${chat?.sellInfo?.sellId}`)}>
        <ProductImage
          src={chat?.sellInfo?.image || "https://via.placeholder.com/100"}
          alt="상품 이미지"
        />
        <ProductDetails>
          <CurrencyTag>{chat?.sellInfo?.currency}</CurrencyTag>
          <PriceContainer>
            <Price>${chat?.sellInfo?.amount?.toLocaleString()}</Price>
            <Dot>·</Dot>
            <KRWAmount>
              {exchangeRates[chat?.sellInfo?.currency]
                ? (
                    chat.sellInfo.amount * exchangeRates[chat.sellInfo.currency]
                  ).toLocaleString()
                : "환율 정보 없음"}{" "}
              원
            </KRWAmount>
          </PriceContainer>
        </ProductDetails>
      </ProductInfo>

      {/* 기존 채팅 메시지 표시 */}
      <ChatContainer>
        {messages.map((msg, index) => (
          <MessageWrapper
            key={index}
            sender={msg.senderId === currentUserId ? "me" : "other"}
          >
            {renderMessage(msg)}{" "}
            {/* ✅ renderMessage를 호출하여 메시지를 렌더링 */}
          </MessageWrapper>
        ))}
      </ChatContainer>

      {/* 거래 장소 추천 */}
      <RecommendationSection>
        <InfoContainer>
          <img src={infoicon} alt="info icon" width="16" height="16" />
          <InfoText>AI에게 거래 장소를 추천받아 보세요</InfoText>
        </InfoContainer>
        <RecommendationButton onClick={() => setShowModal(true)}>
          추천받기
        </RecommendationButton>
        <PlaceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSend={handleSendPlace}
          chatRoomId={chatRoomId}
        />
      </RecommendationSection>

      {/* 메시지 입력창 */}
      <MessageInputContainer>
        <MessageInput
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <SendButton onClick={handleSendMessage}>
          <img src={sendicon} alt="전송" />
        </SendButton>
      </MessageInputContainer>
    </Container>
  );
}

export default Chat;

/* 스타일링 */
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  padding-bottom: 60px;
`;

const Header = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  backdrop-filter: blur(8px);
  padding: 0 12px;
`;

const BackButton = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-left: 0px;
`;

const SellerInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 0;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-left: 50px;
  margin-top: 5px;
`;

const SellerName = styled.b`
  font-size: 16px;
  margin-top: 10px;
  font-weight: 400;
  max-width: 140px;
`;

const StatusContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const StatusButton = styled.button`
  display: flex;
  align-items: center;
  background: #f7f7f7;
  padding: 8px 12px;
  border-radius: 1000px;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? "0.6" : "1")};
`;

const StatusText = styled.div`
  font-size: 12px;
  font-weight: 500;
`;

const StatusDropdown = styled.img`
  width: 10px;
  height: 10px;
  margin-left: 6px;
  opacity: 0.8;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
  min-width: 100px;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  color: #1f2024;
  text-align: left;

  &:hover {
    background: #f7f7f7;
  }
`;

/* 상품 정보 */
const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  gap: 12px;
  border: 2px solid #f7f7f7;
  margin: 5px;
`;

const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  margin-left: 0;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: -110px;
`;

const CurrencyTag = styled.div`
  background: #ca2f28;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 0;
`;

const PriceContainer = styled.div`
  display: flex;
  algn-items: left;
`;

const Price = styled.b`
  font-size: 18px;
`;

const Dot = styled.span`
  color: #898d99;
  margin: 0 6px;
`;

const KRWAmount = styled.span`
  color: #666666;
  font-weight: 300;
  font-size: 10px;
  margin-top: 5px;
`;

/* 채팅 메시지 */
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px;
  padding-bottom: 90px;
  overflow-y: auto;
  margin: 0 !important; //전역 margin auto 제거
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${({ sender }) => (sender === "me" ? "flex-end" : "flex-start")};
  width: 100%;
  padding: 5px 0;
  margin: 0 !important; // 전역 margin auto 제거 
`;


const Message = styled.div`
 margin-left: ${({ sender }) => (sender === "me" ? "auto" : "0")};
  margin-right: ${({ sender }) => (sender === "me" ? "0" : "auto")};
  background: ${({ sender, isPlace }) =>
    isPlace ? "#FFFFFF" : sender === "me" ? "#ca2f28" : "#1F2024"};
  color: ${({ isPlace }) => (isPlace ? "#000000" : "#FFFFFF")};
  padding: 12px 16px;
  border-radius: ${({ sender }) =>
    sender === "me" ? "12px 4px 12px 12px" : "4px 12px 12px 12px"};
  max-width: 75%;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: ${({ sender }) => (sender === "me" ? "right" : "left")};

`;


/* AI 거래 장소 추천 */

const RecommendationSection = styled.div`
  position: fixed;
  bottom: 69px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px); /* 좌우 16px씩 마진 */
  max-width: 375px; /* 중앙에 오게 하고 크기 제한 */
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgb(255, 255, 255);
  font-size: 12px;
  font-weight: 500;
  z-index: 100; /* 다른 요소 위로 */
  border-radius: 4px;
  border: 2px solid #f7f7f7;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0px;
`;

const InfoText = styled.span`
  color: #1f2024;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom: 0px;
`;

const RecommendationButton = styled.button`
  background: #ca2f28;
  color: white;
  font-size: 12px;
  font-weight: 400;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
`;

/*  메시지 입력 */
const MessageInputContainer = styled.div`
  display: ${({ isOpen }) =>
    isOpen ? "none" : "flex"}; /* ✅ 모달이 열리면 숨김 */
  padding: 12px;
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px); /* 좌우 16px씩 마진 */
  max-width: 375px; /* 중앙에 오게 하고 크기 제한 */
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgb(255, 255, 255);
  font-size: 12px;
  font-weight: 300;
  z-index: 80; /* 다른 요소 위로 */
  border-radius: 28px;
  border: 2px solid #f7f7f7;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 8px;
  border: none;
  outline: none;
`;

const SendButton = styled.button`
  width: 35px;
  height: 35px;
  background: black;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 16px;
    height: 16px;
  }
`;
