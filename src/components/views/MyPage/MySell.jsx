import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../utils/api";
import NavBar from "../NavBar/NavBar";
import backarrow from "../../images/backarrow.svg";

function MySell() {
  const navigate = useNavigate();
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [districts, setDistricts] = useState({});

  // ✅ 내 판매 목록 불러오기
  useEffect(() => {
    const fetchMySells = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (!accessToken) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const response = await api.get("/api/sell/mySells", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        console.log("내 판매 목록:", response.data);
        setSells(response.data);
      } catch (err) {
        console.error("내 판매 목록 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMySells();
  }, [navigate]);

  // ✅ 실시간 환율 가져오기
  useEffect(() => {
    const fetchExchangeRates = async () => {
      const uniqueCurrencies = [...new Set(sells.map((sell) => sell.currency))];
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

    if (sells.length > 0) {
      fetchExchangeRates();
    }
  }, [sells]);

  // ✅ 도로명 주소 → 행정동 변환
  useEffect(() => {
    const fetchRegionNames = async () => {
      const newDistricts = {}; // 변환된 주소를 저장할 객체
  
      await Promise.all(
        sells.map(async (sell) => {
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

      setDistricts(newDistricts);
    };

    if (sells.length > 0) {
      fetchRegionNames();
    }
  }, [sells]);

  return (
    <Container>
      <Header>
        <BackButton src={backarrow} alt="뒤로가기" onClick={() => navigate(-1)} />
        <Title>나의 판매</Title>
      </Header>

      <TotalCount>
        Total <span>{sells.length}</span>
      </TotalCount>

      {loading ? (
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>데이터를 불러오지 못했습니다.</ErrorMessage>
      ) : sells.length === 0 ? (
        <NoDataMessage>판매 글이 없습니다.</NoDataMessage>
      ) : (
        <PostListContainer>
          {sells.map((sell) => (
            <Post key={sell._id} onClick={() => navigate(`/sell/${sell._id}`)}>
              <ImageContainer>
            {sell.images && sell.images.length > 0 ? (
           <PostImage src={sell.images[0]} alt="상품 이미지" />
             ) : (
             <NoImage>이미지 없음</NoImage>
            )}
            {sell.status === "거래중" && <ReservedLabel color="#0BB770">거래중</ReservedLabel>}
            {sell.status === "거래완료" && <ReservedLabel color="black">거래완료</ReservedLabel>}
          </ImageContainer>

              <PostInfo>
                <Currency>{sell.currency}</Currency>
                <Amount>{sell.amount} {sell.currency}</Amount>
                <Details>
                  <Location>📍 {districts[sell._id] || sell.location || "위치 정보 없음"}</Location>
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

      <NavBar active="MyPage" />
    </Container>
  );
}

export default MySell;



// 스타일링 
const Container = styled.div`
  width: 375px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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


const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  flex-grow: 1; 
 text-align:center;
`;

const TotalCount = styled.div`
  font-size: 14px;
  font-weight: bold;
  span {
    color: #CA2F28;
  }
  margin-left: 10px;
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
  margin-left: 10px;
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

const Location = styled.div`
  color: #CA2F28;
  margin-bottom: 4px;
  margin-left:0;
`;

const Won = styled.div`
  margin-bottom: 4px;
  margin-left:10px;
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