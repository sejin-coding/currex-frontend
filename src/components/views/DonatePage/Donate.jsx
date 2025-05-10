import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import infoicon from "../../images/infoicon.svg";
import noticealarm from "../../images/noticealarm.svg";
import postmail from "../../images/postmail.svg";
import coffeecup from "../../images/coffeecup.svg";
import downarrow from "../../images/downarrow.svg";
import api from "../../utils/api";

function Donate() {
  const [isOpen, setIsOpen] = useState(true);
  const [myDonationTotal, setMyDonationTotal] = useState(0);
  const toggleRanking = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState([]); // 기부 랭킹 데이터 상태
  // 이름 마스킹 함수
  const maskName = (name) => {
    if (!name || name.length < 2) return name;
    return name[0] + "*".repeat(name.length - 1);
  };
  const [currentTime, setCurrentTime] = useState("");

  // 기부 랭킹 불러오기
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setCurrentTime(formatted);

    const fetchRank = async () => {
      try {
        const accessToken =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const response = await api.get("/api/donation/rank", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        console.log("응답 전체:", response);
        console.log("response.data:", response.data);

        setRankingData(response.data);
      } catch (error) {
        console.error("기부 랭킹 불러오기 실패:", error);
      }
    };

    const fetchMyDonation = async () => {
      try {
        const accessToken =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        const res = await api.get("/api/donation/total", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("내 기부 총액 응답:", res.data);
        setMyDonationTotal(res.data.totalAmount);
      } catch (error) {
        console.error("내 기부 금액 가져오기 실패:", error);
      }
    };

    fetchRank();
    fetchMyDonation();
  }, [navigate]);

  return (
    <Container>
      <Header>
        <Title>기부하기</Title>
        <AlarmIcon src={noticealarm} alt="알림" />
      </Header>

      <DonationBox>
        <DonationHeaderWrapper>
          <DonationHeader>
            <DonationYear>2025년 기부금</DonationYear>
            <DonationAmount>
              {myDonationTotal.toLocaleString()}원
            </DonationAmount>
          </DonationHeader>
          <PostMailIcon src={postmail} alt="기부 메일" />
        </DonationHeaderWrapper>

        <ButtonContainer>
          <InfoButton onClick={() => navigate("/donateinfo")}>
            <InfoIcon src={infoicon} alt="기부 절차 안내" />
            기부 절차 안내
          </InfoButton>
          <DonateButton onClick={() => navigate("/donateregister")}>
            기부하기
          </DonateButton>
        </ButtonContainer>
      </DonationBox>

      <Banner>
        <BannerTextContainer>
          <BannerText>작은 커피 한 잔 값으로</BannerText>
          <BannerTextBold>따뜻한 변화를 만들어 보세요!</BannerTextBold>
        </BannerTextContainer>
        <CoffeeIcon src={coffeecup} alt="커피" />
      </Banner>

      <RankingSection>
        {/* 제목 & 접기 버튼 */}
        <RankingHeader onClick={toggleRanking}>
          <RankingTitle>기부 랭킹</RankingTitle>
          <DownArrowIcon src={downarrow} alt="토글" isOpen={isOpen} />
        </RankingHeader>
        <RankingDate>{currentTime} 기준</RankingDate>

        {isOpen && (
          <RankingList>
            {rankingData.slice(0, 20).map((item, index) => (
              <RankingItem key={item.userId + index}>
                <RankingNumber top3={index < 3}>{item.rank}</RankingNumber>
                <CompanyName>{item.d_company}</CompanyName>
                <UserName>{maskName(item.d_name)}</UserName>
                <RankAmount>{item.totalDonation.toLocaleString()}원</RankAmount>
              </RankingItem>
            ))}
          </RankingList>
        )}
      </RankingSection>
    </Container>
  );
}

export default Donate;

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 16px;
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  padding-bottom: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-top: 10px;
  flex-grow: 1;
  text-align: center;
  margin-left: 50px;
`;

const AlarmIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-right: 3px;
  margin-top: 10px;
`;

const DonationBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid #f1f1f1;
  background: linear-gradient(103deg, #ec662c 0%, #ca2f28 32%);
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.02);
  margin-top: 16px;
`;

const DonationHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  gap: 110px;
  align-self: stretch;
`;

const DonationHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;

const DonationYear = styled.span`
  color: #e1e1e1;
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 500;
`;

const DonationAmount = styled.h1`
  color: #fff;
  font-family: Pretendard;
  font-size: 25px;
  font-weight: 700;
  line-height: 32px;
`;

const PostMailIcon = styled.img`
  display: flex;
  padding: 12px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.16);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
`;

const InfoButton = styled.button`
  display: flex;
  width: 163px;
  height: 60px;
  padding: 12px 21px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  border: 1px solid rgba(241, 241, 241, 0.08);
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

const InfoIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const DonateButton = styled.button`
  display: flex;
  width: 123px;
  height: 60px;
  padding: 12px 21px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  background: #1f2024;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;
const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background: #1f2024;
  margin-top: 16px;
`;

const BannerTextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const BannerText = styled.span`
  width: 190px;
  color: #fff;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
`;

const BannerTextBold = styled.span`
  color: #fff;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.1px;
  margin-left: 0px;
`;

const CoffeeIcon = styled.img`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
`;

/* 랭킹 */
const RankingSection = styled.div`
  margin-top: 16px;
  align-items: left;
`;

const RankingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 190px;
`;

const RankingTitle = styled.h3`
  color: #1f2024;
  font-size: 20px;
  font-weight: 700;
  margin-left: 5px;
`;

const DownArrowIcon = styled.img`
  width: 20px;
  height: 20px;
  transform: ${({ isOpen }) => (isOpen ? "rotate(0deg)" : "rotate(180deg)")};
  transition: transform 0.3s ease;
  margin-right: 2px;
`;

const RankingDate = styled.span`
  color: #c8c8c8;
  font-size: 12px;
  font-weight: 400;
`;

/* 리스트 */
const RankingList = styled.ul`
  margin-top: 16px;
  margin-right: 3px;
  margin-left: -40px;
`;

const RankingItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f1f1f1;
`;

const RankingNumber = styled.span`
  color: ${({ top3 }) => (top3 ? "#CA2F28" : "#1F2024")};
  font-weight: 900;
  text-align: left;
  min-width: 40px; /* 숫자 너비 고정 */
  margin-right: 5px;
`;

const CompanyName = styled.span`
  flex: 1.8;
  font-size: 16px;
  font-weight: 500;
`;

const UserName = styled.span`
  flex: 1;
  font-size: 16px;
  color: #888;
  text-align: center;
`;

const RankAmount = styled.span`
  flex: 1.5;
  font-size: 16px;
  font-weight: bold;
  text-align: right;
  color: #1f2024;
`;
