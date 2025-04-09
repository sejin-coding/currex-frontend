import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backarrow from "../../images/backarrow.svg";
import dropdown from "../../images/dropdown.svg";
import NavBar from "../NavBar/NavBar";
import api from "../../utils/api"; // ✅ 추가

function MyExchange() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [exchangeHistory, setExchangeHistory] = useState([]); // ✅ 상태 추가

  // ✅ API 연동
  useEffect(() => {
    const fetchExchangeHistory = async () => {
      try {
        const response = await api.get("/api/history/exchange"); // 👈 백엔드 연동
        setExchangeHistory(response.data);
      } catch (error) {
        console.error("환전 내역 불러오기 실패:", error);
      }
    };

    fetchExchangeHistory();
  }, []);

  const handleToggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  // ✅ 필터 적용된 데이터
  const filteredHistory =
    selectedFilter === "전체"
      ? exchangeHistory
      : exchangeHistory.filter((item) => item.role === selectedFilter);

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <BackButton src={backarrow} alt="뒤로가기" onClick={() => navigate(-1)} />
        <Title>환전 내역 조회</Title>
      </Header>

      {/* 필터 */}
      <FilterSection>
        <FilterButton onClick={handleToggleDropdown}>
          {selectedFilter}
          <DropdownIcon src={dropdown} alt="드롭다운" />
        </FilterButton>
        {isDropdownOpen && (
          <DropdownMenu>
            {["전체", "판매", "구매"].map((f) => (
              <DropdownItem key={f} onClick={() => handleSelectFilter(f)}>
                {f}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </FilterSection>

      {/* 거래 내역 */}
      <TradeList>
        {filteredHistory.length === 0 ? (
          <p style={{ color: "gray", textAlign: "center" }}>환전 내역이 없습니다.</p>
        ) : (
          filteredHistory.map((exchange, index) => (
            <TradeItem key={index}>
             <TradeLeft>
                <DateText>{new Date(exchange.exchangeDate).toLocaleString("ko-KR")}</DateText>
                <ProfileWrapper>
                  <UserProfile src={exchange.opponent?.profile_img || "https://via.placeholder.com/40"} />
                  <UserName length={exchange.opponent?.nickname.length}>
                    {exchange.opponent?.nickname || "알 수 없음"}
                  </UserName>
                </ProfileWrapper>
              </TradeLeft>

              <TradeDetail>
                <TradeType>{exchange.role}</TradeType>
                <TradeAmount type={exchange.role}>
                  {exchange.currency} {exchange.amount.toLocaleString()}
                </TradeAmount>
                {/* 가격 정보가 없다면 생략 가능 */}
              </TradeDetail>
            </TradeItem>
          ))
        )}
      </TradeList>
      <NavBar active="MyPage" />
    </Container>
  );
}

export default MyExchange;



/* ✅ 스타일 */
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  max-height: 100vh;
  margin: 0 auto; /* 중앙 정렬 */
  position: relative;
  background: #ffffff;
  border-radius: 32px;

  
  flex-direction: column;

  overflow-y: auto;
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none;     /* Firefox */
  padding-bottom: 80px;

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;


const Header = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: white;
`;

const BackButton = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-left: 0px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  flex-grow: 1; 
 text-align:center;
`;

/* 필터 드롭다운 */
const FilterSection = styled.div`
  display: flex;
  position: relative;
  background: #ca2f28;
  padding: 13px 3px;
  justify-content: flex-start;
  margin-bottom:5px;
`;

const FilterButton = styled.button`
  background: white;
  border-radius: 12px;
  padding: 6px 12px;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left:10px;
`;

const DropdownIcon = styled.img`
  width: 12px;
  height: 12px;
  margin-left: 6px;
  opacity: 0.8;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  left: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
  min-width: 100px;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f7f7f7;
  }
`;
const TradeList = styled.div`
  flex: 1;
  padding: 16px;
  color: white;
`;

const TradeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  padding: 12px 0px; /* 좌측 5px 마진 추가 */
`;

const TradeLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-left: 5px;
`;


const DateText = styled.div`
  font-size: 12px;
  color: gray;
  white-space: nowrap;
`;


/* ✅ 프로필 + 유저네임을 감싸는 컨테이너 */
const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-left: 0px;
`;

const UserProfile = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 0px;
`;

const UserName = styled.div`
  color: black;
  text-align: center;
  font-size: ${({ length }) => (length < 10 ? "16px" : "14px")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;


const TradeDetail = styled.div`
  text-align: right;
  margin-right:0;
`;

const TradeType = styled.div`
  font-size: 13px;
  color: black;
  margin-top:0;
`;

const TradeAmount = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-top:10px;
  color: ${({ type }) => (type === "구매" ? "blue" : "red")}; /* 구매(파랑), 판매(빨강) */
`;

const TradePrice = styled.div`
  color: gray;
  font-size: 12px;
`;

