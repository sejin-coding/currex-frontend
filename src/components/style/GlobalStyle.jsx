import { createGlobalStyle } from "styled-components";
import Pretendard from "../utils/font/Pretendard-Medium.woff2";
import PretendardBold from "../utils/font/Pretendard-Bold.woff2";

const GlobalStyle = createGlobalStyle`
 input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield; /* Firefox용 */
  }
    
  @font-face {
    font-family: 'Pretendard';
    src: url(${Pretendard}) format('woff2');
  }
  @font-face {
    font-family: 'Pretendard-Bold';
    src: url(${PretendardBold}) format('woff2');c
  }
  * {
    --vh: 100%;
    margin: 0 auto;
    max-width: 390px;
    box-sizing: border-box;
    font-family: "Pretendard";
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  /* Slider */
.slick-loading .slick-list {
  background: #fff url('./ajax-loader.gif') center center no-repeat;
}
`;

export default GlobalStyle;
