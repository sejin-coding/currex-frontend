import React, { useEffect } from "react";

const KakaoMap = ({ latitude, longitude }) => {
  useEffect(() => {
    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAOMAP_KEY}&libraries=services`;
        script.async = true;
        script.onload = () => {
          initMap();
        };
        document.head.appendChild(script);
      } else {
        initMap();
      }
      console.log("🔍 Kakao Maps API Key:", process.env.REACT_APP_KAKAOMAP_KEY);

    };

    const initMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(latitude || 37.5665, longitude || 126.9780), // 기본 위치: 서울
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);

      // 마커 추가
      if (latitude && longitude) {
        const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
        new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
        });
      }
    };

    loadKakaoMap();
  }, [latitude, longitude]);

  return <div id="map" style={{ width: "100%", height: "300px", borderRadius: "12px" }}></div>;
};

export default KakaoMap;
