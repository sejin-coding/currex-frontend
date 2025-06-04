import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router 사용

import BackArrow from "../../images/backarrow.svg"; // SVG 아이콘 불러오기
import euroflag from "../../images/euro.png";

const rawCurrencyMap = {
  0: { country: "베트남", amount: "100,000 VND", krwValue: "-" },
  1: { country: "베트남", amount: "10,000 VND", krwValue: "-" },
  2: { country: "일본", amount: "10,000 JPY", krwValue: "-" },
  3: { country: "홍콩", amount: "1,000 HKD", krwValue: "-" },
  4: { country: "베트남", amount: "1,000 VND", krwValue: "-" },
  5: { country: "일본", amount: "1,000 JPY", krwValue: "-" },
  6: { country: "대만", amount: "1,000 TWD", krwValue: "-" },
  7: { country: "호주", amount: "100 AUD", krwValue: "-" },
  8: { country: "홍콩", amount: "100 HKD", krwValue: "-" },
  9: { country: "미국", amount: "100 USD", krwValue: "-" },
  10: { country: "유럽 연합", amount: "100 EUR", krwValue: "-" },
  11: { country: "일본", amount: "100 JPY", krwValue: "-" },
  12: { country: "중국", amount: "100 CNY", krwValue: "-" },
  13: { country: "대만", amount: "100 TWD", krwValue: "-" },
  14: { country: "호주", amount: "10 CENT", krwValue: "-" },
  15: { country: "유럽 연합", amount: "10 CENT", krwValue: "-" },
  16: { country: "홍콩", amount: "10 CENT", krwValue: "-" },
  17: { country: "미국", amount: "10 CENT", krwValue: "-" },
  18: { country: "호주", amount: "10 AUD", krwValue: "-" },
  19: { country: "홍콩", amount: "10 HKD", krwValue: "-" },
  20: { country: "미국", amount: "10 USD", krwValue: "-" },
  21: { country: "홍콩", amount: "10 HKD (동전)", krwValue: "-" },
  22: { country: "유럽 연합", amount: "10 EUR", krwValue: "-" },
  23: { country: "일본", amount: "10 JPY", krwValue: "-" },
  24: { country: "중국", amount: "10 CNY", krwValue: "-" },
  25: { country: "대만", amount: "10 TWD (동전)", krwValue: "-" },
  26: { country: "유럽 연합", amount: "1 CENT", krwValue: "-" },
  27: { country: "미국", amount: "1 CENT", krwValue: "-" },
  28: { country: "미국", amount: "1 USD", krwValue: "-" },
  29: { country: "호주", amount: "1 AUD (동전)", krwValue: "-" },
  30: { country: "홍콩", amount: "1 HKD (동전)", krwValue: "-" },
  31: { country: "미국", amount: "1 USD (동전)", krwValue: "-" },
  32: { country: "유럽 연합", amount: "1 EUR", krwValue: "-" },
  33: { country: "중국", amount: "1 JIAO", krwValue: "-" },
  34: { country: "일본", amount: "1 JPY", krwValue: "-" },
  35: { country: "중국", amount: "1 CNY", krwValue: "-" },
  36: { country: "중국", amount: "1 CNY (동전)", krwValue: "-" },
  37: { country: "대만", amount: "1 TWD (동전)", krwValue: "-" },
  38: { country: "베트남", amount: "200,000 VND", krwValue: "-" },
  39: { country: "베트남", amount: "20,000 VND", krwValue: "-" },
  40: { country: "베트남", amount: "2,000 VND", krwValue: "-" },
  41: { country: "일본", amount: "2,000 JPY", krwValue: "-" },
  42: { country: "대만", amount: "2,000 TWD", krwValue: "-" },
  43: { country: "베트남", amount: "200 VND", krwValue: "-" },
  44: { country: "유럽 연합", amount: "200 EUR", krwValue: "-" },
  45: { country: "대만", amount: "200 TWD", krwValue: "-" },
  46: { country: "유럽 연합", amount: "20 CENT", krwValue: "-" },
  47: { country: "홍콩", amount: "20 CENT", krwValue: "-" },
  48: { country: "호주", amount: "20 AUD", krwValue: "-" },
  49: { country: "홍콩", amount: "20 HKD", krwValue: "-" },
  50: { country: "미국", amount: "20 USD", krwValue: "-" },
  51: { country: "유럽 연합", amount: "20 EUR", krwValue: "-" },
  52: { country: "중국", amount: "20 CNY", krwValue: "-" },
  53: { country: "대만", amount: "20 TWD (동전)", krwValue: "-" },
  54: { country: "미국", amount: "25 CENT", krwValue: "-" },
  55: { country: "유럽 연합", amount: "2 CENT", krwValue: "-" },
  56: { country: "미국", amount: "2 USD", krwValue: "-" },
  57: { country: "호주", amount: "2 AUD (동전)", krwValue: "-" },
  58: { country: "홍콩", amount: "2 HKD (동전)", krwValue: "-" },
  59: { country: "유럽 연합", amount: "2 EUR", krwValue: "-" },
  60: { country: "베트남", amount: "500,000 VND", krwValue: "-" },
  61: { country: "베트남", amount: "50,000 VND", krwValue: "-" },
  62: { country: "베트남", amount: "5,000 VND", krwValue: "-" },
  63: { country: "일본", amount: "5,000 JPY", krwValue: "-" },
  64: { country: "홍콩", amount: "500 HKD", krwValue: "-" },
  65: { country: "베트남", amount: "500 VND", krwValue: "-" },
  66: { country: "유럽 연합", amount: "500 EUR", krwValue: "-" },
  67: { country: "일본", amount: "500 JPY", krwValue: "-" },
  68: { country: "대만", amount: "500 TWD", krwValue: "-" },
  69: { country: "호주", amount: "50 CENT", krwValue: "-" },
  70: { country: "유럽 연합", amount: "50 CENT", krwValue: "-" },
  71: { country: "홍콩", amount: "50 CENT", krwValue: "-" },
  72: { country: "미국", amount: "50 CENT", krwValue: "-" },
  73: { country: "호주", amount: "50 AUD", krwValue: "-" },
  74: { country: "홍콩", amount: "50 HKD", krwValue: "-" },
  75: { country: "미국", amount: "50 USD", krwValue: "-" },
  76: { country: "유럽 연합", amount: "50 EUR", krwValue: "-" },
  77: { country: "일본", amount: "50 JPY", krwValue: "-" },
  78: { country: "중국", amount: "50 CNY", krwValue: "-" },
  79: { country: "대만", amount: "50 TWD (동전)", krwValue: "-" },
  80: { country: "호주", amount: "5 CENT", krwValue: "-" },
  81: { country: "유럽 연합", amount: "5 CENT", krwValue: "-" },
  82: { country: "미국", amount: "5 CENT", krwValue: "-" },
  83: { country: "호주", amount: "5 AUD", krwValue: "-" },
  84: { country: "미국", amount: "5 USD", krwValue: "-" },
  85: { country: "홍콩", amount: "5 HKD (동전)", krwValue: "-" },
  86: { country: "유럽 연합", amount: "5 EUR", krwValue: "-" },
  87: { country: "중국", amount: "5 JIAO", krwValue: "-" },
  88: { country: "일본", amount: "5 JPY", krwValue: "-" },
  89: { country: "중국", amount: "5 CNY", krwValue: "-" },
  90: { country: "대만", amount: "5 TWD (동전)", krwValue: "-" },
  default: { country: "알 수 없음", amount: "-", krwValue: "-" },
};

const Detect = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currencyData, setCurrencyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [cameraHeight, setCameraHeight] = useState(window.innerHeight * 0.8);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencyMap, setCurrencyMap] = useState(rawCurrencyMap);

  // 환율 API 호출
  useEffect(() => {
    axios
      .get("https://api.exchangerate-api.com/v4/latest/KRW")
      .then((res) => {
        const rates = res.data.rates;

        // currencyMap에 krwValue 추가
        const updatedMap = {};
        Object.entries(rawCurrencyMap).forEach(([key, val]) => {
          const amountParts = val.amount.split(" ");
          const value = parseFloat(amountParts[0].replace(/,/g, ""));

          const unit = amountParts[1].toUpperCase();

          let rate = rates[unit];
          if (unit === "CENT") {
            rate = rates["USD"] / 100;
          } else if (unit === "JIAO") {
            rate = rates["CNY"] / 10;
          }

          const krwValue = rate ? Math.round(value * (1 / rate)) : "-";

          updatedMap[key] = {
            ...val,
            krwValue,
          };
        });

        setExchangeRates(rates);
        setCurrencyMap(updatedMap);
      })
      .catch((err) => console.error("환율 호출 실패:", err));
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      setCameraHeight(window.innerHeight * 0.8);
    };
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" }, // 후면 카메라
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
        alert("후면 카메라를 찾을 수 없습니다. 기본 카메라로 전환됩니다.");
        // fallback: 일반 카메라
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      }
    };
    startCamera();
  }, []);

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      setLoading(true);
      try {
        const response = await axios.post(
          "https://currex.kro.kr/predict",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("FastAPI 응답:", response.data);

        let detectedCurrency = {
          country: "알 수 없음",
          amount: "-",
          krwValue: "-",
        };

        if (response.data?.predictions?.length > 0) {
          const ctx = canvas.getContext("2d");

          // confidence 기준 정렬하고 상위 2개 추출
          const sortedPredictions = response.data.predictions.sort(
            (a, b) => b.confidence - a.confidence
          );
          const topTwo = sortedPredictions.slice(0, 2);

          // 바운딩 박스 그리기
          topTwo.forEach((pred) => {
            const [x1, y1, x2, y2] = pred.bbox;

            ctx.strokeStyle = "limegreen";
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            const cls = pred.class;
            const label = currencyMap[cls]?.amount || "Detected";
            ctx.font = "16px Pretendard";
            ctx.fillStyle = "limegreen";
            ctx.fillText(label, x1, y1 - 8);
          });

          // 감지된 화폐 정보
          const cls = topTwo[0].class;
          detectedCurrency = currencyMap[cls] || currencyMap["default"];
        }

        setCurrencyData(detectedCurrency);
        setShowPopup(true);
      } catch (error) {
        console.error("화폐 감지 오류:", error);
        setCurrencyData({ country: "오류 발생", amount: "-", krwValue: "-" });
        setShowPopup(true);
      }
      setLoading(false);
    }, "image/jpeg");
  };

  return (
    <div style={styles.container}>
      {/* 이전 버튼 & 타이틀 */}
      <div style={styles.header}>
        <img
          src={BackArrow}
          alt="뒤로 가기"
          style={styles.backButton}
          onClick={() => navigate(-1)} // 이전 페이지로 이동
        />
        <h2 style={styles.title}>외국 돈, AI로 바로 인식!</h2>
      </div>

      {/* 카메라 화면 */}
      <div style={{ ...styles.cameraContainer, height: `${cameraHeight}px` }}>
        <video ref={videoRef} autoPlay playsInline style={styles.video}></video>
      </div>

      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={styles.canvas}
      ></canvas>

      {/* 감지 버튼 */}
      <div style={styles.buttonContainer}>
        <button
          style={styles.detectButton}
          onClick={captureAndDetect}
          disabled={loading}
        >
          {loading ? "처리 중..." : "감지하기"}
        </button>
      </div>

      {/* 감지된 결과 팝업 */}
      {showPopup && currencyData && (
        <div style={styles.popup}>
          <h3 style={styles.popupTitle}>화폐 정보</h3>
          <div style={styles.popupContent}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>화폐의 국가</span>
              <span style={styles.infoValue}>
                {currencyData.country === "유럽 연합" && (
                  <img
                    src={euroflag}
                    alt="유럽 연합"
                    style={{
                      width: "20px",
                      height: "14px",
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                )}
                {currencyData.country}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>금액</span>
              <span style={styles.infoValue}>{currencyData.amount}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>현재 원화 가치</span>
              <span style={styles.infoValue}>{currencyData.krwValue}원</span>
            </div>
          </div>
          <button
            style={styles.confirmButton}
            onClick={() => {
              setShowPopup(false);
              setCurrencyData(null); // 감지 정보 초기화
              const ctx = canvasRef.current.getContext("2d");
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              ); // 캔버스 초기화
            }}
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
};

export default Detect;

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Pretendard, sans-serif",
    padding: "20px",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    gap: "10px",
    paddingBottom: "30px",
  },
  backButton: {
    width: "24px",
    height: "24px",
    cursor: "pointer",
    position: "absolute",
    left: "5px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: 0,
    flex: 1,
    textAlign: "center",
  },
  cameraWrapper: {
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12px",
    overflow: "hidden",
    background: "black",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  buttonContainer: {
    marginTop: "15px",
  },
  detectButton: {
    backgroundColor: "#CA2F28",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },
  popup: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
    minWidth: "300px",
    maxWidth: "360px",
    fontFamily: "Pretendard, sans-serif",
  },
  popupTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  popupContent: {
    padding: "10px 0",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: "15px",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    flex: 1,
  },
  infoValue: {
    color: "#666",
    textAlign: "right",
    flex: 1,
  },
  confirmButton: {
    backgroundColor: "#CA2F28",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%",
    marginTop: "15px",
  },

  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none", // 클릭 방해 안 되게
  },
};
