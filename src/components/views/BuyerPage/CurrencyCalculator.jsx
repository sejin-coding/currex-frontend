import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backarrow from "../../images/backarrow.svg";
import dropdown from "../../images/dropdown.svg";

function CurrencyCalculator() {
  const [currency, setCurrency] = useState("USD"); // 기본 선택된 통화
  const [exchangeRates, setExchangeRates] = useState({}); // 모든 환율 저장
  const [coinData, setCoinData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [totalCoin, setTotalCoin] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const [showCoins, setShowCoins] = useState(true); // 동전 섹션 열림/접힘 상태
  const [showBills, setShowBills] = useState(true); // 지폐 섹션 열림/접힘 상태

  const navigate = useNavigate();

  // 스타일 관련 설정
  const toggleSection = (section) => {
    if (section === "coins") {
      setShowCoins(!showCoins);
    } else if (section === "bills") {
      setShowBills(!showBills);
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 100); // 스크롤이 100px 이상 내려가면 숨김
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // 통화별 데이터 설정
  const currencyConfig = {
    JPY: {
      symbol: "\u00a5",
      coins: [
        { denomination: 1, amount: 0 },
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
        { denomination: 500, amount: 0 },
      ],
      bills: [
        { denomination: 1000, amount: 0 },
        { denomination: 5000, amount: 0 },
        { denomination: 10000, amount: 0 },
      ],
    },
    USD: {
      symbol: "\u0024",
      coins: [
        { denomination: 0.01, amount: 0 },
        { denomination: 0.05, amount: 0 },
        { denomination: 0.1, amount: 0 },
        { denomination: 0.25, amount: 0 },
        { denomination: 0.5, amount: 0 },
      ],
      bills: [
        { denomination: 1, amount: 0 },
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 20, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
      ],
    },
    EUR: {
      symbol: "\u20ac",
      coins: [
        { denomination: 0.01, amount: 0 },
        { denomination: 0.02, amount: 0 },
        { denomination: 0.05, amount: 0 },
        { denomination: 0.1, amount: 0 },
        { denomination: 0.2, amount: 0 },
        { denomination: 0.5, amount: 0 },
        { denomination: 1, amount: 0 },
        { denomination: 2, amount: 0 },
      ],
      bills: [
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 20, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
        { denomination: 200, amount: 0 },
      ],
    },
    CNY: {
      symbol: "\u5143",
      coins: [
        { denomination: 0.1, amount: 0 },
        { denomination: 0.5, amount: 0 },
        { denomination: 1, amount: 0 },
      ],
      bills: [
        { denomination: 1, amount: 0 },
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 20, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
      ],
    },
    HKD: {
      symbol: "\u0024",
      coins: [
        { denomination: 0.1, amount: 0 },
        { denomination: 0.2, amount: 0 },
        { denomination: 0.5, amount: 0 },
        { denomination: 1, amount: 0 },
        { denomination: 2, amount: 0 },
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
      ],
      bills: [
        { denomination: 10, amount: 0 },
        { denomination: 20, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
        { denomination: 500, amount: 0 },
        { denomination: 1000, amount: 0 },
      ],
    },
    TWD: {
      symbol: "\u0024",
      coins: [
        { denomination: 1, amount: 0 },
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 50, amount: 0 },
      ],
      bills: [
        { denomination: 100, amount: 0 },
        { denomination: 500, amount: 0 },
        { denomination: 1000, amount: 0 },
      ],
    },
    AUD: {
      symbol: "\u0024",
      coins: [
        { denomination: 0.05, amount: 0 },
        { denomination: 0.1, amount: 0 },
        { denomination: 0.2, amount: 0 },
        { denomination: 0.5, amount: 0 },
        { denomination: 1, amount: 0 },
        { denomination: 2, amount: 0 },
      ],
      bills: [
        { denomination: 5, amount: 0 },
        { denomination: 10, amount: 0 },
        { denomination: 20, amount: 0 },
        { denomination: 50, amount: 0 },
        { denomination: 100, amount: 0 },
      ],
    },
    VND: {
      symbol: "\u20ab",
      coins: [
        { denomination: 200, amount: 0 },
        { denomination: 500, amount: 0 },
        { denomination: 1000, amount: 0 },
        { denomination: 2000, amount: 0 },
        { denomination: 5000, amount: 0 },
      ],
      bills: [
        { denomination: 10000, amount: 0 },
        { denomination: 20000, amount: 0 },
        { denomination: 50000, amount: 0 },
        { denomination: 100000, amount: 0 },
        { denomination: 200000, amount: 0 },
        { denomination: 500000, amount: 0 },
      ],
    },
  };

  const formatDenomination = (type, denomination, currency) => {
    const cents = {
      USD: "¢",
      EUR: "c",
      HKD: "¢",
      AUD: "¢",
    };
  
    const fullSymbol = {
      USD: "$",
      EUR: "€",
      JPY: "¥",
      CNY: "元",
      HKD: "HK$",
      TWD: "NT$",
      AUD: "$",
      VND: "₫"
    };
  
    // 동전일 때
    if (type === "coin") {
      if (currency === "USD" && denomination < 1) return `${Math.round(denomination * 100)}¢`;
      if (currency === "EUR" && denomination < 1) return `${Math.round(denomination * 100)}c`;
      if (currency === "HKD" && denomination < 1) return `${Math.round(denomination * 100)}¢`;
      if (currency === "AUD" && denomination < 1) return `${Math.round(denomination * 100)}¢`;
      if (currency === "CNY" && denomination < 1) return `${denomination}元`;
      return `${fullSymbol[currency] || ""}${denomination}`;
    }
  
    // 지폐일 때
    if (currency === "CNY") return `${denomination}元`;
    return `${fullSymbol[currency] || ""}${denomination}`;
  };
  

  // 환율 API 호출
  useEffect(() => {
    axios
      .get("https://api.exchangerate-api.com/v4/latest/KRW")
      .then((response) => {
        const rates = response.data.rates;
  
        // 다른 통화를 KRW 기준으로 변환
        const krwRates = Object.keys(rates).reduce((acc, key) => {
          acc[key] = 1 / rates[key];
          return acc;
        }, {});
  
        setExchangeRates(krwRates);
      })
      .catch((error) => console.error("환율 API 호출 실패:", error));
  }, []);
  

  // 통화 변경 시 데이터 업데이트
  useEffect(() => {
    if (currencyConfig[currency]) {
      setCoinData(currencyConfig[currency].coins);
      setBillData(currencyConfig[currency].bills);
    }
  }, [currency]);

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleCoinChange = (index, value) => {
    const updatedCoins = [...coinData];
    updatedCoins[index].amount = parseInt(value) || 0;
    setCoinData(updatedCoins);
  };

  const handleBillChange = (index, value) => {
    const updatedBills = [...billData];
    updatedBills[index].amount = parseInt(value) || 0;
    setBillData(updatedBills);
  };

  useEffect(() => {
    const coinTotal = coinData.reduce(
      (acc, item) => acc + item.denomination * item.amount,
      0
    );
    setTotalCoin(coinTotal);
  
    const billTotal = billData.reduce(
      (acc, item) => acc + item.denomination * item.amount,
      0
    );
    setTotalBill(billTotal);
  }, [coinData, billData]);
  

  return (
    <Container>
      <Header>
        <BackButton src={backarrow} alt="뒤로가기" onClick={() => navigate(-1)} />
        <CurrencySelector>
        <CurrencyDropdown value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="JPY">JPY</option>
            <option value="EUR">EUR</option>
            <option value="CNY">CNY</option>
            <option value="HKD">HKD</option>
            <option value="TWD">TWD</option>
            <option value="AUD">AUD</option>
            <option value="VND">VND</option>
          </CurrencyDropdown>
          <CurrencyDropdownIcon src={dropdown} alt="드롭다운 아이콘" />
        </CurrencySelector>
      </Header>

      <TitleContainer>
        <Title>{currency}를 얼마나 <br></br>소유하고 계신가요?</Title>
        <ExchangeRateText>1 {currency} = {exchangeRates[currency]?.toFixed(2) || 0} 원</ExchangeRateText>
      </TitleContainer>

      <Section>
        <SectionHeader onClick={() => toggleSection("coins")}>
          <SectionTitle>동전</SectionTitle>
          <DropdownIcon src={dropdown} alt="접기/펼치기 아이콘" rotated={!showCoins} />
        </SectionHeader>
        <Divider />
        {showCoins &&
          coinData.map((coin, index) => (
            <Row key={coin.denomination}>
              <Denomination>
                {formatDenomination("coin", coin.denomination, currency)}
              </Denomination>
              <ValueContainer isHighlighted={coin.amount > 0}>
              <Equals>=</Equals>
              <ConvertedValue>
                <span style={{ color: "#1f2024" }}> 
                {(coin.denomination * exchangeRates[currency] || 0).toFixed(2)}
                </span>
                <span style={{ color: "#8ea0ac", marginLeft: "4px" }}> 
                원
                </span>
                </ConvertedValue>
                <AmountInput
                  type="number"
                  value={coin.amount}
                  onChange={(e) => handleCoinChange(index, e.target.value)}
                />
                <Unit>개</Unit>
              </ValueContainer>
            </Row>
          ))}
      </Section>

      <Section>
        <SectionHeader onClick={() => toggleSection("bills")}>
          <SectionTitle>지폐</SectionTitle>
          <DropdownIcon src={dropdown} alt="접기/펼치기 아이콘" rotated={!showBills} />
        </SectionHeader>
        <Divider />
        {showBills &&
          billData.map((bill, index) => (
            <Row key={bill.denomination}>
              <Denomination>
                {formatDenomination("bill", bill.denomination, currency)}
              </Denomination>
              <ValueContainer isHighlighted={bill.amount > 0}>
              <Equals>=</Equals>
              <ConvertedValue>
                <span style={{ color: "#1f2024" }}> 
                {(bill.denomination * exchangeRates[currency] || 0).toFixed(2)}
                </span>
                <span style={{ color: "#8ea0ac", marginLeft: "4px" }}> 
                원
                </span>
                </ConvertedValue>

                <AmountInput
                  type="number"
                  value={bill.amount}
                  onChange={(e) => handleBillChange(index, e.target.value)}
                />
                <Unit>개</Unit>
              </ValueContainer>
            </Row>
          ))}
      </Section>

      <TotalContainer isHidden={isScrolled}>
        <TotalText>
        {currencyConfig[currency]?.symbol} {(totalCoin + totalBill).toFixed(2)}
        </TotalText>
  
        <TotalText>
        총 {((totalCoin + totalBill) * (exchangeRates[currency] || 0)).toFixed(2)}  원
        </TotalText>
      </TotalContainer>


    </Container>
  );
}

export default CurrencyCalculator;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: white;
  box-shadow: 0px 8px 24px rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  overflow-x: hidden;
  padding-bottom: 50px;
`;

const Header = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
`;

const BackButton = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left:0px;
`;

const CurrencySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2024;
  border-radius: 1000px;
  cursor: pointer;
  position: relative;
  margin-left:15px;
`;


const CurrencyDropdown = styled.select`
  border: none;
  background: none;
  font-size: 18px;
  font-weight: 700;
  color: #1f2024;
  cursor: pointer;
  appearance: none;
  outline: none;
  padding: 8px 10px;
`;

const CurrencyDropdownIcon = styled.img`
  width: 12px;
  height: 12px;
  opacity: 0.8;
`;

const DropdownIcon = styled.img`
  width: 12px;
  height: 12px;
  margin-right:0px;
  margin-top:6px;
  transform: ${({ rotated }) => (rotated ? "rotate(180deg)" : "rotate(0)")};
`;

const TitleContainer = styled.div`
  padding: 20px 16px;
  margin-left:0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom:10px;
  margin-left:0;
`;

const ExchangeRateText = styled.p`
  font-size: 13px;
  font-weight: 300;
  color: #898d99;
`;

const Section = styled.div`
  margin-bottom: 24px;
  margin-left: 0px;
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #1f2024;
  margin-bottom: 2px;
  margin-left: -10px;  
`;

const Divider = styled.div`
  height: 1px;
  background-color:rgba(241, 241, 241, 0.94);
  margin-bottom:20px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; 
  margin-bottom: 12px;
  margin-left: 10px; 
  width: 100%; 
`;

const Denomination = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1f2024;
  min-width: 50px; 
  margin-left:0;
  text-align: left; 
`;


const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  padding: 16px 12px; 
  border: 1px solid ${({ isHighlighted }) => (isHighlighted ? "#CA2F28" : "#F1F1F1")};
  border-radius: 8px;
  transition: border-color 0.2s;
  margin-right:15px;

  &:focus-within {
    border-color: #CA2F28; /* 입력 포커스 시 빨간색 */
  }
`;

const ConvertedValue = styled.span`
  flex: 1;
  text-align: right;
  font-size: 13px;
  font-weight: 400;
  color: #1f2024;
  margin-right: 8px;
`;

const Equals = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #8ea0ac; 
  margin-right: 8px;
`;

const Unit = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: #8ea0ac; 
`;


const AmountInput = styled.input`
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 400;
  border: none;
  outline: none;
  margin-left: 30px;
  margin-right: 0px;
   -webkit-appearance: none; /* 크롬 등 Webkit 브라우저 */
  -moz-appearance: textfield; /* 파이어폭스 */
  appearance: none; /* 기타 브라우저 */
`;

const TotalContainer = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 16px 24px;
  background: #1f2024;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  display: ${({ isHidden }) => (isHidden ? "none" : "flex")}; /* 스크롤 시 숨김 */
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  transition: all 0.3s ease; 
`;



const TotalText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  white-space: nowrap; 
`;

