import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import leftarrow from "../../images/backarrow.svg";
import money from "../../images/money.svg";
import check from "../../images/check.svg";
import location from "../../images/locationicon.svg";

function DonateInfo() {
  const navigate = useNavigate();

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <BackIcon src={leftarrow} alt="뒤로가기" />
        </BackButton>
      </Header>

      {/* 타이틀 */}
      <TitleContainer>
        <Title>기부 방법이 궁금하신가요?</Title>
        <Subtitle>절차를 알려드릴게요 !</Subtitle>
      </TitleContainer>

      {/* 돈 이미지 */}
      <MoneyImage src={money} alt="기부 절차" />

      {/* 기부 절차 카드 */}
      <StepContainer>
        <Step>
          <StepIcon src={check} alt="체크" />
          <StepText>
            <StepTitle>기부 등록</StepTitle>
            <StepDescription>
              기부하기를 누르시고 다음에 나오는 기부폼을 입력하여 기부를 등록해
              주세요. 등록하시면, 기부를 위한 주소를 안내해 드립니다.
            </StepDescription>
          </StepText>
        </Step>

        <Step>
          <StepIcon src={check} alt="체크" />
          <StepText>
            <StepTitle>수령 확인</StepTitle>
            <StepDescription>
              안내해 드린 주소로 안전하게 발송해 주시면 수령 확인 후 상태를
              업데이트 해 드립니다.
            </StepDescription>
            <Address>
              <LocationIcon src={location} alt="주소" />
              서울특별시 서대문구 이화여대길 52 (03760)
            </Address>
          </StepText>
        </Step>

        <Step>
          <StepIcon src={check} alt="체크" />
          <StepText>
            <StepTitle>기부 처리중</StepTitle>
            <StepDescription>
              사용자 여러분의 기부금은 일정 기간 모인 후, 연말에 한 번에 지정된
              기부 단체에 전달됩니다. 이렇게 모아서 기부하면, 적은 금액도 큰
              기부가 될 수 있습니다. 기부가 완료되면 저희가 기부 내역을 연말정산
              시스템에 등록하여, 사용자가 손쉽게 소득공제 혜택을 받으실 수
              있도록 지원합니다.
            </StepDescription>
          </StepText>
        </Step>

        <Step>
          <StepIcon src={check} alt="체크" />
          <StepText>
            <StepTitle>소득공제 완료</StepTitle>
            <StepDescription>
              소득공제까지 완료되면 완료 상태로 변경됩니다.
            </StepDescription>
          </StepText>
        </Step>
      </StepContainer>

      {/* 세금 혜택 안내 */}
      <TaxInfo>
        * 한국에서는 기부금에 대해 세금 혜택을 적용합니다.
        <br />
        10만원 이하의 기부금은 100% 소득공제가 적용되며,
        <br />
        10만원을 초과하는 금액에 대해서는 소득에 따라 공제율이 달라집니다.
      </TaxInfo>

      {/* 확인 버튼 */}
      <ConfirmButton onClick={() => navigate("/donate")}>
        확인했습니다
      </ConfirmButton>
    </Container>
  );
}

export default DonateInfo;

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 16px;
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  padding-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  width: 100%;
  height: 40px;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 10px;
  background: none;
  border: none;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
`;

const BackIcon = styled.img`
  width: 15px;
  height: 15px;
  margin-left: 0px;
`;

const TitleContainer = styled.div`
  text-align: left;
  margin-bottom: 18px;
`;

const Title = styled.h1`
  color: #1f2024;
  font-size: 20px;
  font-weight: 700;
  line-height: 32px;
`;

const Subtitle = styled.p`
  color: #1f2024;
  font-size: 20px;
  font-weight: 700;
  line-height: 32px;
`;

const MoneyImage = styled.img`
  width: 214px;
  height: 214px;
  display: block;
  margin: 0 auto 24px;
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8f8f8;
  width: 100%;
`;

const StepIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const StepText = styled.div`
  flex: 1;
`;

const StepTitle = styled.h2`
  color: #1f2024;
  font-size: 18px;
  font-weight: 600;
  line-height: 20px;
  margin-bottom: 10px;
`;

const StepDescription = styled.p`
  color: #666;
  font-size: 13px;
  font-weight: 300;
  line-height: 18px;
  letter-spacing: -0.33px;
`;

const Address = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #1f2024;
  margin-top: 7px;
`;

const LocationIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const TaxInfo = styled.p`
  margin-top: 28px;
  color: #898d99;
  font-size: 14px;
  font-weight: 300;
  line-height: 18px;
  text-align: center;
`;

const ConfirmButton = styled.button`
  display: flex;
  width: 334px;
  padding: 14px 36px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: #1f2024;
  box-shadow: 0px 5px 10px 0px rgba(26, 26, 26, 0.1);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  cursor: pointer;
  margin: 24px auto 0;
`;
