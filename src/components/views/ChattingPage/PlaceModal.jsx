import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../../utils/api";

function PlaceModal({ isOpen, onClose, onSend, chatRoomId }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    //console.log("📌 chatRoomId 요청 URL:", `/api/chat/placeRecommend?chatRoomId=${chatRoomId}`);

    const fetchRecommendedPlace = async () => {
      try {
        const response = await api.get(`/api/chat/placeRecommend`, {  // ✅ 쿼리 파라미터 방식으로 변경
          params: { chatRoomId },
        });

        console.log("✅ 추천 장소 응답:", response.data);

        if (!response.data) {
          setLoading(false);
          return;
        }

        setPlace({
          name: response.data.place_name, // ✅ 백엔드 응답 구조에 맞게 수정
          latitude: response.data.y, // ✅ 카카오 API 응답에서 `y`가 위도
          longitude: response.data.x, // ✅ 카카오 API 응답에서 `x`가 경도
        });

        setLoading(false);
      } catch (error) {
        console.error("추천 장소 불러오기 실패:", error);
        setLoading(false);
      }
    };

    fetchRecommendedPlace();
  }, [isOpen, chatRoomId]);

  useEffect(() => {
    if (!isOpen || !place) return;

    const initializeMap = () => {
      const container = document.getElementById("kakao-map");
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(place.latitude, place.longitude),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);

      new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(place.latitude, place.longitude),
        map: map,
      });

      setMapLoaded(true);
    };

    if (!window.kakao || !window.kakao.maps) {
      const scriptExists = document.querySelector('script[src*="dapi.kakao.com"]');

      if (!scriptExists) {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAOMAP_KEY}&libraries=services&autoload=false`;
        script.async = true;

        script.onload = () => {
          window.kakao.maps.load(initializeMap);
        };

        document.body.appendChild(script);
      } else {
        window.kakao.maps.load(initializeMap);
      }
    } else {
      window.kakao.maps.load(initializeMap);
    }
  }, [isOpen, place]);

  if (!isOpen) return null;

  

  return (
    <ModalContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>추천 장소</Title>
      {loading ? (
        <LoadingText>추천 장소를 불러오는 중...</LoadingText>
      ) : place ? (
        <>
          <Description>
            나와 거래 상대자의 추천 거래 장소는 <br />
            <strong>{place.name}</strong>입니다.
          </Description>
          <MapContainer id="kakao-map">{!mapLoaded && <LoadingText>지도 로딩 중...</LoadingText>}</MapContainer>
          <SendButton onClick={() => onSend(place)}>전송하기</SendButton>
        </>
      ) : (
        <Description>추천할 거래 장소가 없습니다.</Description>
      )}
    </ModalContainer>
  );
}

export default PlaceModal;
/* 
const Overlay = styled.div` 
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index:9990;
`;*/

const ModalContainer = styled.div`
  background: white;
  width: 90%;
  max-width: 350px;
  height: auto; 
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  position: fixed; 
  top:-350%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 100000; 
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #C1C1C1;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 13px;
  font-weight:300;
  color: #555;
  margin-top:20px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 130px; 
  margin: 10px 0;
  border-radius: 8px;
  position: relative; 
`;

const LoadingText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 14px;
`;

const PlaceInfo = styled.div`
  background: #f7f7f7;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
`;

const PlaceName = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const Distance = styled.div`
  font-size: 12px;
  color: #666;
`;

const SendButton = styled.button`
  background: black;
  color: white;
  font-size: 14px;
  font-weight: 400;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 12px; /* ✅ 버튼이 다른 요소와 겹치지 않도록 마진 추가 */
  z-index: 150; /* ✅ 맵보다 위에 위치하도록 조정 */
`;
