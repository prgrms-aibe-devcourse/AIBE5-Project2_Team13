import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FloatingSupportButton from './components/FloatingSupportButton';
import Home from './pages/Home';
import BrowseClasses from './pages/BrowseClasses';
import SearchPage from './pages/SearchPage';
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
import { AIChatProvider } from './context/AIChatContext';
import { ClassProvider } from './context/ClassContext';
import { FreelancerProvider } from './context/FreelancerContext';
import { FollowProvider } from './context/FollowContext';
import { WishProvider } from './context/WishContext';

export default function App() {
  return (
    <Router>
      <AIChatProvider>
        <FreelancerProvider>
          <FollowProvider>
            <WishProvider>
              <ClassProvider>
                <CategoryProvider>
                  <ReportProvider>
                    <EnrollmentProvider>
                      <RequestProvider>
                        <div className="min-h-screen bg-ivory flex flex-col">
                          <Header />
                          <main className="flex-1">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/browse" element={<BrowseClasses />} />
                              <Route path="/search" element={<SearchPage />} />
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
                              <Route path="/profile/activity" element={<MyPage initialMenu="activity" />} />
                              <Route path="/profile/my-requests" element={<MyPage initialMenu="my_requests" />} />
                              <Route path="/profile/reviews" element={<MyPage initialMenu="reviews" />} />
                              <Route path="/profile/pick" element={<MyPage initialMenu="pick" />} />
                              <Route path="/profile/following" element={<MyPage initialMenu="following" />} />
                              <Route path="/profile/freelancer/dashboard" element={<MyPage initialMenu="freelancer_dashboard" />} />
                              <Route path="/profile/freelancer/classes" element={<MyPage initialMenu="freelancer_classes" />} />
                              <Route path="/profile/freelancer/students" element={<MyPage initialMenu="freelancer_students" />} />
                              <Route path="/profile/freelancer/profile" element={<MyPage initialMenu="freelancer_profile" />} />
                              <Route path="/profile/admin/home" element={<MyPage initialMenu="admin_home" />} />
                              <Route path="/profile/admin/users" element={<MyPage initialMenu="admin_users" />} />
                              <Route path="/profile/admin/reports" element={<MyPage initialMenu="admin_reports" />} />
                              <Route path="/profile/admin/approvals" element={<MyPage initialMenu="admin_approvals" />} />
                              <Route path="/profile/settings" element={<MyPage initialMenu="settings" />} />
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
            </WishProvider>
          </FollowProvider>
        </FreelancerProvider>
      </AIChatProvider>
    </Router>
  );
}
