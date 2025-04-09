import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalStyle from "../src/components/style/GlobalStyle";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BuyMoney from "../src/components/views/BuyerPage/BuyMoney";
import Calculator from "../src/components/views/BuyerPage/CurrencyCalculator";
import SellerMatch from "../src/components/views/BuyerPage/SellerMatch";
import SellMoney from "../src/components/views/SellerPage/SellMoney";
import PostList from "../src/components/views/PostListPage/PostList";
import PostDetail from "../src/components/views/PostListPage/PostDetail";
import Chat from "../src/components/views/ChattingPage/Chat";
import ChatList from "../src/components/views/ChattingPage/ChatList";
import Login from "../src/components/views/LoginPage/Login";
import Layout from "./components/views/Layout/Layout";
import KakaoMap from "./components/utils/KakaoMap";
import MyPage from "./components/views/MyPage/MyPage";
import MySell from "./components/views/MyPage/MySell";
import MyExchange from "./components/views/MyPage/MyExchange";
import Detect from "./components/views/ModelPage/Detect";
import Donate from "./components/views/DonatePage/Donate";
import DonateInfo from "./components/views/DonatePage/DonateInfo";
import DonateRegister from "./components/views/DonatePage/DonateRegister";
import MyDonate from "./components/views/MyPage/MyDonate";

function App() {
  return (
    <div className="App">
      <GlobalStyle />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route exact path="/buy" element={<BuyMoney />} />
            <Route exact path="/SellerMatch" element={<SellerMatch />} />
            <Route exact path="/calculator" element={<Calculator />} />
            <Route exact path="/sell" element={<SellMoney />} />
            <Route exact path="/list" element={<PostList />} />
            <Route path="/sell/:sellId" element={<PostDetail />} />
            <Route exact path="/chat/:chatRoomId" element={<Chat />} />
            <Route exact path="/chatlist" element={<ChatList />} />
            <Route exact path="/" element={<Login />} />
            <Route exact path="/auth/kakao/callback" element={<Login />} />
            <Route exact path="/mypage" element={<MyPage />} />
            <Route exact path="/mysell" element={<MySell />} />
            <Route exact path="/myexchange" element={<MyExchange />} />
            <Route exact path="/detect" element={<Detect />} />
            <Route exact path="/donate" element={<Donate />} />
            <Route path="/donateinfo" element={<DonateInfo />} />
            <Route path="/donateregister" element={<DonateRegister />} />
            <Route exact path="/mydonate" element={<MyDonate />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
