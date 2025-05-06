import React, { useState, useEffect, useRef } from "react";

import styled from "styled-components";
import infoicon from "../../images/infoicon.svg";
import NavBar from "../NavBar/NavBar";
import locationicon from "../../images/locationicon.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../utils/api";
import dropdown from "../../images/dropdown.svg";

function PostList() {
  const navigate = useNavigate();
  const [sells, setSells] = useState([]); // 판매글 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [filteredSells, setFilteredSells] = useState([]); // 필터링된 판매 데이터

  // 필터 상태
  const [selectedCountries, setSelectedCountries] = useState([]); // 선택한 국가
  const [minWon, setMinWon] = useState(""); // 최소 금액 (원화)
  const [maxWon, setMaxWon] = useState(""); // 최대 금액 (원화)

  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const [selectedSort, setSelectedSort] = useState("latest"); // 정렬 상태

  const [districts, setDistricts] = useState({}); // 변환된 행정동 정보를 저장할 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);



  useEffect(() => {
    const fetchSells = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        //console.log("현재 저장된 accessToken:", accessToken);

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          navigate("/");
          return;
        }

        const response = await api.get("/api/sell/sellList", { 
          withCredentials: true, // 쿠키 전달 설정
        })
    
    

        //console.log("불러온 판매 데이터:", response.data);
        setSells(response.data);
      } catch (err) {
        console.error("판매 목록 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSells();
  }, [navigate]);


  //거래주소없으면 마이페이지로 이동하게 하기
  const [showTradeAddressModal, setShowTradeAddressModal] = useState(false);
  useEffect(() => {
  const checkUserTradeAddress = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!accessToken) return;

      const userResponse = await api.get("/api/user/mypage", {
        withCredentials: true,
      });

      const user = userResponse.data;
      if (!user.tradeAddress || user.tradeAddress.trim() === "") {
        setShowTradeAddressModal(true); // 모달 표시
      }
    } catch (error) {
      console.error("유저 정보 가져오기 실패:", error);
    }
  };

  checkUserTradeAddress();
}, []);


  // 실시간 환율 가져오기
  const [exchangeRates, setExchangeRates] = useState({}); // 환율 데이터를 저장할 상태

  useEffect(() => {
  const fetchExchangeRates = async () => {
    const uniqueCurrencies = [...new Set(sells.map((sell) => sell.currency))]; // 중복 제거
    const rates = {};

    try {
      // 각 통화에 대한 환율 데이터를 비동기적으로 가져오기
      await Promise.all(
        uniqueCurrencies.map(async (currency) => {
          const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
          rates[currency] = response.data.rates.KRW; // KRW에 대한 환율 저장
        })
      );

      setExchangeRates(rates); // 가져온 환율 데이터 상태 업데이트
    } catch (error) {
      console.error("환율 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  if (sells.length > 0) {
    fetchExchangeRates();
  }
}, [sells]);

// 정렬 함수 (정렬된 배열을 반환)
const sortSells = (sells, sortType) => {
  let sorted = [...sells];

  if (sortType === "latest") {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortType === "distance") {
    sorted.sort((a, b) => {
      const distanceA = parseFloat(a.distance);
      const distanceB = parseFloat(b.distance);

      if (isNaN(distanceA)) return 1;
      if (isNaN(distanceB)) return -1;

      return distanceA - distanceB;
    });
  }

  return sorted;
};

useEffect(() => {
  let filtered = [...sells];

  // 선택한 국가 필터 적용
  if (selectedCountries.length > 0) {
    filtered = filtered.filter((sell) => selectedCountries.includes(sell.currency));
  }

  // 원화 기준 금액 필터 적용
  if (minWon !== "" || maxWon !== "") {
    filtered = filtered.filter((sell) => {
      const wonPrice = exchangeRates[sell.currency] ? sell.amount * exchangeRates[sell.currency] : null;
      if (wonPrice === null) return false;

      const minCheck = minWon === "" || wonPrice >= parseFloat(minWon) * 10000; // "만원" 기준
      const maxCheck = maxWon === "" || wonPrice <= parseFloat(maxWon) * 10000;
      return minCheck && maxCheck;
    });
  }

  // 정렬 적용
  let sortedFiltered = [...filtered]; // 새로운 배열 생성
  if (selectedSort === "latest") {
    sortedFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (selectedSort === "distance") {
    sortedFiltered.sort((a, b) => {
      const distanceA = parseFloat(a.distance);
      const distanceB = parseFloat(b.distance);

      if (isNaN(distanceA)) return 1;
      if (isNaN(distanceB)) return -1;

      return distanceA - distanceB;
    });
  }
  console.log("distance 값 확인:", sells.map(s => s.distance));

  //console.log("정렬된 데이터:", sortedFiltered);
  setFilteredSells([...sortedFiltered]); // 새로운 배열을 상태에 직접 반영
}, [selectedCountries, minWon, maxWon, sells, exchangeRates, selectedSort]);


//국가 필터
  const handleCountryChange = (currency) => {
  setSelectedCountries((prev) => {
    if (prev.includes(currency)) {
      const updated = prev.filter((c) => c !== currency);
      return updated.length === 0 ? [] : updated;  // 모든 국가 해제 시 '전체' 유지
    } else {
      if (prev.length >= 2) {
        alert("최대 2개 국가만 선택할 수 있습니다.");
        return prev;
      }
      return [...prev, currency];
    }
  });
};

//도로명 주소를 ~구 ~동으로 변환하기기
useEffect(() => {
  const fetchRegionNames = async () => {
    const newDistricts = {}; // 변환된 주소를 저장할 객체

    await Promise.all(
      filteredSells.map(async (sell) => {
        if (!sell.location) return;

        try {
          // 도로명 주소 → 좌표 변환
          const addressResponse = await axios.get(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(sell.location)}`,
            {
              headers: { Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_API_KEY}` },
            }
          );

          if (!addressResponse.data.documents.length) {
            console.warn(`주소 검색 실패: ${sell.location}`);
            return;
          }

          const { x, y } = addressResponse.data.documents[0]; // 위도, 경도 값 가져오기

          // 좌표 → 행정동 변환
          const regionResponse = await axios.get(
            `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${x}&y=${y}`,
            {
              headers: { Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_API_KEY}` },
            }
          );

          if (!regionResponse.data.documents.length) {
            console.warn(`⚠️ 행정동 변환 실패: ${sell.location} (x=${x}, y=${y})`);
            return;
          }

          // 'H' (행정동) 타입인 지역 정보 가져오기
          const regionInfo = regionResponse.data.documents.find((doc) => doc.region_type === "H");

          if (regionInfo) {
            newDistricts[sell._id] = `${regionInfo.region_2depth_name} ${regionInfo.region_3depth_name}`;
            //console.log(`변환 완료: ${sell.location} → ${newDistricts[sell._id]}`);
          } else {
            console.warn(`행정동 정보 없음: ${sell.location} (x=${x}, y=${y})`);
          }
        } catch (error) {
          console.error("주소 변환 오류:", error);
        }
      })
    );

    setDistricts(newDistricts); // 변환된 데이터 상태에 저장
  };

  if (filteredSells.length > 0) {
    fetchRegionNames();
  }
}, [filteredSells]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
      setShowSortDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  const handleNavigateToBuy = () => navigate("/buy");
  const handleRegisterClick = () => navigate("/sell");

  return (
    <Container>
     <Header>
        <Title>판매 목록</Title>
        <FilterContainer>
        <FilterButton
          selected={selectedCountries.length > 0 && selectedCountries.length < 3} // 국가 선택됨 && 전체가 아님
          onClick={() => setShowCountryFilter(true)}
        >
        국가 {selectedCountries.length > 0 ? selectedCountries.join(", ") : "전체"} ▸
         </FilterButton>

         <FilterButton
          selected={minWon && maxWon} // 금액 필터 설정 시 빨간색
          onClick={() => setShowPriceFilter(true)}
          >
        금액 범위 {minWon && maxWon ? `${minWon}만원 - ${maxWon}만원` : "설정하기"} ▸
        </FilterButton>
      </FilterContainer>

      </Header>

      <SortWrapper ref={sortDropdownRef}>
        <SortButton onClick={() => setShowSortDropdown(!showSortDropdown)}>
          {selectedSort === "latest" ? "최신순" : "거리순"}
          <SortDropdownIcon src={dropdown} alt="드롭다운" />
        </SortButton>

        {showSortDropdown && (
          <SortDropdownMenu>
            <SortDropdownItem onClick={() => { setSelectedSort("latest"); setShowSortDropdown(false); }}>
              최신순
            </SortDropdownItem>
            <SortDropdownItem onClick={() => { setSelectedSort("distance"); setShowSortDropdown(false); }}>
              거리순
            </SortDropdownItem>
          </SortDropdownMenu>
        )}
      </SortWrapper>

      {/* 거래 주소 입력 모달 */}
      {showTradeAddressModal && (
      <Modal>
        <ModalContent>
          <h3>거래 주소를 입력해 주세요.</h3>
          <MoveButton
            onClick={() => {
              setShowTradeAddressModal(false);
              navigate("/mypage"); // 마이페이지로 이동
            }}
          >
            마이페이지로 이동
          </MoveButton>
        </ModalContent>
      </Modal>
    )}

      {/* 국가 필터 모달 */}
      {showCountryFilter && (
        <Modal>
          <ModalContent>
            <h4>국가 선택 (최대 2개)</h4>
            <CountryButtonWrapper>
              <CountryButton
                selected={selectedCountries.length === 0}
                onClick={() => setSelectedCountries([])}
              >
                전체
              </CountryButton>
              {["USD", "JPY", "EUR", "CNY", "HKD", "TWD", "AUD", "VND"].map((currency) => (
                <CountryButton
                  key={currency}
                  selected={selectedCountries.includes(currency)}
                  onClick={() => handleCountryChange(currency)}
                >
                  {currency}
                </CountryButton>
              ))}
            </CountryButtonWrapper>
            <ModalActions>
              <CloseButton onClick={() => setShowCountryFilter(false)}>닫기</CloseButton>
            </ModalActions>
          </ModalContent>

        </Modal>
      )}

      {/* 금액 필터 모달 */}
      {showPriceFilter && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h4>금액 범위 선택</h4>
              <ResetButton onClick={() => { setMinWon(""); setMaxWon(""); }}>초기화</ResetButton>
            </ModalHeader>

            <PriceInputContainer>
              <PriceInput
                type="number"
                placeholder="00"
                value={minWon}
                onChange={(e) => setMinWon(e.target.value)}
              />
              <span>만원 -</span>
              <PriceInput
                type="number"
                placeholder="00"
                value={maxWon}
                onChange={(e) => setMaxWon(e.target.value)}
              />
              <span>만원</span>
            </PriceInputContainer>

            <ConfirmButton onClick={() => setShowPriceFilter(false)}>확인</ConfirmButton>
          </ModalContent>
        </Modal>
)}



{loading ? (
  <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
) : error ? (
  <ErrorMessage>데이터를 불러오지 못했습니다.</ErrorMessage>
) : filteredSells.length === 0 ? (  // 필터링된 결과를 기준으로 판단
  <NoDataMessage>판매 글이 없습니다.</NoDataMessage>
) : (
  <PostListContainer>
    {filteredSells.map((sell) => (  // 필터링된 데이터 사용
          <Post key={sell._id} onClick={() => navigate(`/sell/${sell._id}`)}>
          <ImageContainer>
                {sell.images && sell.images.length > 0 ? (
                  <PostImage src={sell.images[0]} alt="상품 이미지" />
                ) : (
                  <NoImage>이미지 없음</NoImage>
                )}
                {sell.status === "판매중" && <ReservedLabel color="#1E62C1">판매중</ReservedLabel>}
                {sell.status === "거래중" && <ReservedLabel color="#0BB770">거래중</ReservedLabel>}
                {sell.status === "거래완료" && <ReservedLabel color="black">거래완료</ReservedLabel>}
              </ImageContainer>

          <PostInfo>
          <Currency>{sell.currency}</Currency>
          <Amount>{sell.amount} {sell.currency}</Amount>
          <Details>
          <Distance>
          📍 {districts[sell._id] ? districts[sell._id] : sell.location ? sell.location : "위치 정보 없음"}
          </Distance>

            <Won>
            {exchangeRates[sell.currency]
            ? `${Math.round(sell.amount * exchangeRates[sell.currency])} 원`
            : "환율 정보 없음"}
           </Won>
          </Details>
          </PostInfo>

    </Post>
))}
        </PostListContainer>
      )}

      <RegisterButton onClick={handleRegisterClick}>판매등록+</RegisterButton>

      <RecommendationSection>
        <InfoContainer>
          <img src={infoicon} alt="info icon" width="16" height="16" />
          <InfoText>AI에게 판매자를 추천받아 보세요</InfoText>
        </InfoContainer>
        <RecommendationButton onClick={handleNavigateToBuy}>추천받기</RecommendationButton>
      </RecommendationSection>

      <NavBar active="list" />
    </Container>
  );
}

export default PostList;

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
  padding: 16px;
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
  gap: 20px; /* 국가 버튼과 금액 버튼 간격 */
  margin-top: 10px;
`;

const FilterButton = styled.button`
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid ${(props) => (props.selected ? "#CA2F28" : "#ccc")}; /* 선택 여부에 따라 테두리 변경 */
  color: ${(props) => (props.selected ? "#CA2F28" : "#888")}; /* 선택 시 빨간색 */
  background: #fff;
  cursor: pointer;
  transition: border 0.3s, color 0.3s;

  &:hover {
    border-color: #CA2F28;
  }
`;


const Modal = styled.div`
 position: fixed;
  inset: 0; /* top, right, bottom, left를 전부 0으로 */
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;


const CountryButton = styled.button`
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid ${({ selected }) => (selected ? "#CA2F28" : "#ccc")};
  background: ${({ selected }) => (selected ? "#CA2F28" : "#fff")};
  color: ${({ selected }) => (selected ? "#fff" : "#1f2024")};
  border-radius: 8px;
  cursor: pointer;
  margin: 4px;
`;

const CountryButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 0 12px;
`;


const ModalContent = styled.div`
  background: white;
  padding: 24px 20px;
  border-radius: 20px;
  width: 85%;
  max-width: 340px;
  text-align: center;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    font-size: 16px;
    font-weight: 700;
    color: #1f2024;
  }
`;

const ResetButton = styled.button`
  background: #e0e0e0;
  color: #1f2024;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;

const PriceInputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  font-size: 14px;
`;

const PriceInput = styled.input`
  width: 64px;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const ConfirmButton = styled.button`
  background: #1f2024;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 16px;

  &:hover {
    background: #333;
  }
`;

const MoveButton = styled.button`
  background: #CA2F28;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  &:hover {
    background: #333;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CloseButton = styled.button`
  background: #1f2024;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 6px;

  &:hover {
    background: #333;
  }
`;

const SortWrapper = styled.div`
  position: relative;
  margin-right: 10px;
`;

const SortButton = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2024;
  cursor: pointer;
`;

const SortDropdownIcon = styled.img`
  width: 10px;
  height: 10px;
  opacity: 0.6;
`;

const SortDropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
  min-width: 90px;
`;

const SortDropdownItem = styled.div`
  padding: 6px 10px; 
  font-size: 15px;
  cursor: pointer;
  color: #1f2024;
  text-align: left;

  &:hover {
    background: #f7f7f7;
  }
`;

const DropdownIcon = styled.img`
  width: 10px;
  height: 10px;
`;

const PostListContainer = styled.div`
  flex: 1;
  margin-left: 0;
  overflow-y: auto; /* 세로 스크롤 가능 */
  padding-bottom: 120px; /* RecommendationSection과 NavBar 공간 확보 */
  margin-right: 0px;

  /* 스크롤바 스타일 */
  scrollbar-width: thin; /* Firefox: 얇은 스크롤바 */
  scrollbar-color: #ccc transparent; /* Firefox: 스크롤바 색상 */

  &::-webkit-scrollbar {
    width: 6px; /* Chrome, Safari: 스크롤바 너비 */
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc; /* Chrome, Safari: 스크롤바 색상 */
    border-radius: 3px; /* Chrome, Safari: 스크롤바 둥글게 */
  }

  &::-webkit-scrollbar-track {
    background: transparent; /* Chrome, Safari: 트랙 배경 투명 */
  }
`;

const Post = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #eee;
  padding: 16px 0;
  margin-left:10px;
`;

const ImageContainer = styled.div`
  position: relative;
`;

const PostImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
`;

const ReservedLabel = styled.div`
  position: absolute;
  bottom: 8px;
  left: 6px;
  background: ${({ color }) => color};
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight:200px;
`;

const PostInfo = styled.div`
  flex: 1;
`;

const Currency = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #8ea0ac;
  background: rgba(142, 160, 172, 0.08);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 4px;
`;

const Amount = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Details = styled.div`
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: left;
  gap: 4px; /* 텍스트 간 간격 */
`;

const Distance = styled.div`
  color: #CA2F28;
  margin-bottom: 4px;
  margin-left:0;
`;

const Won = styled.div`
  margin-bottom: 4px;
  margin-right:5px;
`;

const Location = styled.div`
  display: flex;
  gap: 0px;
  color: #898D99;
  font-size: 12px;
  align-self: flex-start; 
  margin-left:00px;
`;

const RecommendationSection = styled.div`
  position: fixed;
  bottom: 62px; /* NavBar 바로 위 */
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
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1); /* 약간의 그림자 효과 */
  border-radius: 4px;
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom:0px;
  
`;

const InfoText = styled.span`
  color: #1f2024;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom:0px;
`;

const RecommendationButton = styled.button`
  background: #CA2F28;
  color: white;
  font-size: 12px;
  font-weight: 400;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
`;

const RegisterButton = styled.button`
  position: fixed;
  bottom: 124px; /* RecommendationSection 위에 고정 */
  transform: translateX(-50%); /* 중앙 정렬 */
  margin-left:300px;
  background: #000;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 60px;
  padding: 14px 16px;
  cursor: pointer;
  z-index: 101; /* 다른 요소 위로 */
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

const NoImage = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #888;
`; 

