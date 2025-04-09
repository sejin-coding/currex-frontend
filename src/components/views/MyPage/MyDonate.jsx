import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backarrow from "../../images/backarrow.svg";
import dropdown from "../../images/dropdown.svg";
import NavBar from "../NavBar/NavBar";
import api from "../../utils/api";

function MyDonate() {
  const steps = ["기부 등록", "수령 확인", "기부 처리중", "소득 공제 완료"];
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);

  // statusMap의 반대 버전 생성
  const reverseStatusMap = {
    "기부 등록": "registered",
    "수령 확인": "checked",
    "기부 처리중": "processing",
    "소득 공제 완료": "finished",
  };

  const [donationCounts, setDonationCounts] = useState({
    registered: 0,
    checked: 0,
    processing: 0,
    finished: 0,
  });

  const counts = [
    donationCounts.registered,
    donationCounts.checked,
    donationCounts.processing,
    donationCounts.finished,
  ];

  const getDateRange = () => {
    if (!donationHistory.length) return "기록 없음";

    const sorted = [...donationHistory].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    const first = new Date(sorted[0].createdAt);
    const last = new Date(sorted[sorted.length - 1].createdAt);
    return `${first.toLocaleDateString("ko-KR")} ~ ${last.toLocaleDateString(
      "ko-KR"
    )}`;
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const accessToken =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        // 기부 내역 조회
        const res1 = await api.get("/api/history/donations", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(res1.data);
        setDonationHistory(res1.data);

        // 상태별 기부 조회
        const res2 = await api.get("/api/donation/donationProcess", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(res2.data);
        setDonationCounts(res2.data);
      } catch (err) {
        console.error("기부 내역 or 상태 정보 불러오기 실패", err);
      }
    };

    fetchDonations();
  }, []);

  // 필터링
  const filteredDonations =
    selectedFilter === "전체"
      ? donationHistory
      : donationHistory.filter(
          (d) => d.status === reverseStatusMap[selectedFilter]
        );

  const handleToggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  const statusMap = {
    registered: "기부 등록",
    checked: "수령 확인",
    processing: "기부 처리중",
    finished: "소득 공제 완료",
  };

  return (
    <Container>
      <Header>
        <BackButton
          src={backarrow}
          alt="뒤로가기"
          onClick={() => navigate(-1)}
        />
        <Title>기부내역 조회</Title>
      </Header>

      <Divider />

      <ProgressSection>
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <Step>
              <Circle>{counts[idx]}</Circle>
              <StepLabel>{step}</StepLabel>
            </Step>
            {idx < steps.length - 1 && <Arrow>→</Arrow>}
          </React.Fragment>
        ))}
      </ProgressSection>

      {/* 🔴 빨간 바 + 필터 드롭다운 */}
      <FilterSection>
        <FilterButton onClick={handleToggleDropdown}>
          {selectedFilter}
          <DropdownIcon src={dropdown} alt="드롭다운" />
        </FilterButton>
        {isDropdownOpen && (
          <DropdownMenu>
            {steps.map((step, idx) => (
              <DropdownItem key={idx} onClick={() => handleSelectFilter(step)}>
                {step}
              </DropdownItem>
            ))}
            <DropdownItem onClick={() => handleSelectFilter("전체")}>
              전체
            </DropdownItem>
          </DropdownMenu>
        )}
      </FilterSection>

      <Divider />

      <DateRange>{getDateRange()}</DateRange>

      <DonationList>
        {filteredDonations.map((donation, idx) => (
          <DonationItem key={idx}>
            <Left>
              <DonationDate>
                {new Date(donation.createdAt).toLocaleString("ko-KR")}
              </DonationDate>
              <DonationAmount>
                {donation.amount.toLocaleString()}원
              </DonationAmount>
            </Left>
            <DonationStatus>{statusMap[donation.status]}</DonationStatus>
          </DonationItem>
        ))}
        <More>+ 더보기</More>
      </DonationList>

      <NavBar active="MyPage" />
    </Container>
  );
}

export default MyDonate;

const Container = styled.div`
  width: 375px;
  height: 812px;
  background: #ffffff;
  border-radius: 32px;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const BackButton = styled.img`
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
`;

const StepLabel = styled.div`
  font-size: 12px;
  margin-top: 6px;
`;

const Arrow = styled.div`
  font-size: 16px;
  margin: 0 8px;
  color: gray;
`;

const Circle = styled.div`
  width: 28px;
  height: 28px;
  background-color: #d9d9d9;
  border-radius: 50%;
  text-align: center;
  line-height: 28px;
  font-size: 14px;
  font-weight: bold;
`;

const FilterSection = styled.div`
  display: flex;
  position: relative;
  background: #ca2f28;
  padding: 13px 3px;
  justify-content: flex-start;
  margin-bottom: 5px;
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
  margin-left: 10px;
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
  min-width: 120px;
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

const Divider = styled.hr`
  margin: 10px;
  border: none;
  border-top: 1px solid #ddd;
`;

const DateRange = styled.div`
  font-size: 12px;
  color: gray;
  margin: 20px 16px;
`;

const MonthTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin: 12px 16px 0;
`;

const DonationList = styled.div`
  padding: 0 16px;
`;

const DonationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: -7px;
`;

const DonationDate = styled.div`
  font-size: 12px;
  color: gray;
`;

const DonationAmount = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #ca2f28;
  margin-top: 20px;
  margin-left: -2px;
`;

const DonationStatus = styled.div`
  font-size: 13px;
  color: black;
  margin-right: -3px;
`;

const More = styled.div`
  text-align: center;
  color: gray;
  font-size: 14px;
  margin-top: 12px;
  cursor: pointer;
`;
