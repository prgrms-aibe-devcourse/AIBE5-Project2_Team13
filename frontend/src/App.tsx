import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FloatingSupportButton from './components/FloatingSupportButton';
import Home from './pages/Home';
import BrowseClasses from './pages/BrowseClasses';
import RequestBoard from './pages/RequestBoard';
import ExpertRegister from './pages/ExpertRegister';
import AICounseling from './pages/AICounseling';
import ClassDetail from './pages/ClassDetail';
import RequestDetail from './pages/RequestDetail';
import MyPage from './pages/MyPage';
import Chat from './pages/Chat';
import RequestWrite from './pages/RequestWrite';
import RequestEdit from './pages/RequestEdit';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FAQPage from './pages/FAQPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import ExpertRegistrationForm from './pages/ExpertRegistrationForm';
import ClassFormPage from './pages/ClassFormPage';
import Footer from './components/Footer';
import { RequestProvider } from './context/RequestContext';
import { CategoryProvider } from './context/CategoryContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import { ReportProvider } from './context/ReportContext';
import { AIChatProvider, ChatHistoryManager } from './context/AIChatContext';
import { ClassProvider } from './context/ClassContext';
import { FreelancerProvider } from './context/FreelancerContext';
import { FollowProvider } from './context/FollowContext';

export default function App() {
  return (
    <Router>
      <AIChatProvider>
        <FreelancerProvider>
          <FollowProvider>
            <ClassProvider>
              <CategoryProvider>
                <ReportProvider>
                  <EnrollmentProvider>
                    <RequestProvider>
                      <ChatHistoryManager />
                      <div className="min-h-screen bg-ivory flex flex-col">
                        <Header />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/browse" element={<BrowseClasses />} />
                            <Route path="/requests" element={<RequestBoard />} />
                            <Route path="/requests/write" element={<RequestWrite />} />
                            <Route path="/requests/edit/:id" element={<RequestEdit />} />
                            <Route path="/expert-register" element={<ExpertRegister />} />
                            <Route path="/expert-register/form" element={<ExpertRegistrationForm />} />
                            <Route path="/class/create" element={<ClassFormPage />} />
                            <Route path="/class/edit/:id" element={<ClassFormPage />} />
                            <Route path="/ai-recommend" element={<AICounseling />} />
                            <Route path="/class/:id" element={<ClassDetail />} />
                            <Route path="/request/:id" element={<RequestDetail />} />
                            <Route path="/profile" element={<MyPage />} />
                            <Route path="/mypage/profile-edit" element={<MyPage initialMenu="freelancer_profile" />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/faq" element={<FAQPage />} />
                            <Route path="/freelancer/:id" element={<FreelancerProfilePage />} />
                          </Routes>
                        </main>
                        <FloatingSupportButton />
                        <Footer />
                      </div>
                    </RequestProvider>
                  </EnrollmentProvider>
                </ReportProvider>
              </CategoryProvider>
            </ClassProvider>
          </FollowProvider>
        </FreelancerProvider>
      </AIChatProvider>
    </Router>
  );
}