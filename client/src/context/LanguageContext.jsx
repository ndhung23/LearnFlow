import { createContext, useEffect, useState } from "react";

const LANGUAGE_STORAGE_KEY = "learnflow_language";

const translations = {
  en: {
    common: {
      brand: "LearnFlow",
      language: "Language",
      vietnamese: "Tiếng Việt",
      english: "English",
      loading: "Loading...",
    },
    topbar: {
      logIn: "Log in",
      getStarted: "Get started",
      logOut: "Log out",
      notifications: "Notifications",
      noNotifications: "No notifications yet.",
    },
    authLayout: {
      heading: "Build better study habits without the clutter.",
      description:
        "Create flashcards, launch quizzes, assign work, and keep progress visible for admins, teachers, and students.",
    },
    login: {
      eyebrow: "Welcome Back",
      title: "Log in to LearnFlow",
      description:
        "Demo accounts are seeded. Try `admin@learnflow.app`, `talia@learnflow.app`, or `sara@learnflow.app` with `Password123!`.",
      email: "Email",
      password: "Password",
      submit: "Log In",
      submitting: "Signing in...",
      footer: "Need an account?",
      footerLink: "Create one",
      fallbackError: "Unable to sign in.",
    },
    register: {
      eyebrow: "Create Account",
      title: "Start using LearnFlow",
      description:
        "Register as a teacher or student. Admin users are created from the admin dashboard.",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      role: "Role",
      student: "Student",
      teacher: "Teacher",
      submit: "Create Account",
      submitting: "Creating account...",
      footer: "Already have an account?",
      footerLink: "Log in",
      fallbackError: "Unable to create your account.",
    },
    home: {
      eyebrow: "Study Platform for Teams",
      title: "Teach, practice, and track progress in one focused learning workspace.",
      description:
        "LearnFlow helps teachers build flashcard-based learning paths, quizzes, and assignments while students move between learn, test, and match modes with less friction.",
      primaryCta: "Launch Your Workspace",
      secondaryCta: "Sign In",
      featureEyebrow: "Why it works",
      feature1Title: "Flashcards that stay focused",
      feature1Description:
        "Flip quickly, shuffle terms, and mark what you know without losing momentum.",
      feature2Title: "Assignments with role clarity",
      feature2Description:
        "Admins manage the system, teachers run classes, and students stay on top of work.",
      feature3Title: "Import and scale content",
      feature3Description:
        "Bring in CSV, JSON, or quick pasted text, preview it, and publish in minutes.",
    },
    sidebar: {
      description: "Focused study, role-based workflows, and progress that stays visible.",
      adminDashboard: "Admin Dashboard",
      teacherDashboard: "Teacher Dashboard",
      studentDashboard: "Student Dashboard",
      classes: "Classes",
      studySets: "Study Sets",
      assignments: "Assignments",
      import: "Import",
      profile: "Profile",
      settings: "Settings",
    },
  },
  vi: {
    common: {
      brand: "LearnFlow",
      language: "Ngôn ngữ",
      vietnamese: "Tiếng Việt",
      english: "English",
      loading: "Đang tải...",
    },
    topbar: {
      logIn: "Đăng nhập",
      getStarted: "Bắt đầu",
      logOut: "Đăng xuất",
      notifications: "Thông báo",
      noNotifications: "Chưa có thông báo.",
    },
    authLayout: {
      heading: "Xây dựng thói quen học tốt hơn mà không bị rối mắt.",
      description:
        "Tạo flashcard, mở quiz, giao bài và theo dõi tiến độ rõ ràng cho admin, giáo viên và học viên.",
    },
    login: {
      eyebrow: "Chào mừng trở lại",
      title: "Đăng nhập vào LearnFlow",
      description:
        "Tài khoản demo đã được seed sẵn. Hãy thử `admin@learnflow.app`, `talia@learnflow.app` hoặc `sara@learnflow.app` với mật khẩu `Password123!`.",
      email: "Email",
      password: "Mật khẩu",
      submit: "Đăng nhập",
      submitting: "Đang đăng nhập...",
      footer: "Chưa có tài khoản?",
      footerLink: "Tạo tài khoản",
      fallbackError: "Không thể đăng nhập.",
    },
    register: {
      eyebrow: "Tạo tài khoản",
      title: "Bắt đầu với LearnFlow",
      description:
        "Đăng ký với vai trò giáo viên hoặc học viên. Tài khoản admin được tạo từ trang quản trị.",
      fullName: "Họ và tên",
      email: "Email",
      password: "Mật khẩu",
      role: "Vai trò",
      student: "Học viên",
      teacher: "Giáo viên",
      submit: "Tạo tài khoản",
      submitting: "Đang tạo tài khoản...",
      footer: "Đã có tài khoản?",
      footerLink: "Đăng nhập",
      fallbackError: "Không thể tạo tài khoản.",
    },
    home: {
      eyebrow: "Nền tảng học tập cho đội nhóm",
      title: "Dạy, luyện tập và theo dõi tiến độ trong một không gian học tập tập trung.",
      description:
        "LearnFlow giúp giáo viên xây dựng lộ trình học bằng flashcard, quiz và bài giao, trong khi học viên chuyển nhanh giữa chế độ học, kiểm tra và ghép cặp.",
      primaryCta: "Khởi tạo không gian học",
      secondaryCta: "Đăng nhập",
      featureEyebrow: "Lý do hiệu quả",
      feature1Title: "Flashcard luôn tập trung",
      feature1Description:
        "Lật nhanh, trộn thẻ và đánh dấu mức độ ghi nhớ mà không làm ngắt mạch học.",
      feature2Title: "Bài giao rõ vai trò",
      feature2Description:
        "Admin quản lý hệ thống, giáo viên vận hành lớp học, học viên luôn nắm rõ việc cần làm.",
      feature3Title: "Nhập nội dung và mở rộng nhanh",
      feature3Description:
        "Đưa vào CSV, JSON hoặc văn bản dán nhanh, xem trước rồi xuất bản chỉ trong vài phút.",
    },
    sidebar: {
      description: "Học tập tập trung, luồng theo vai trò và tiến độ luôn hiển thị rõ ràng.",
      adminDashboard: "Bảng điều khiển admin",
      teacherDashboard: "Bảng điều khiển giáo viên",
      studentDashboard: "Bảng điều khiển học viên",
      classes: "Lớp học",
      studySets: "Bộ học liệu",
      assignments: "Bài được giao",
      import: "Nhập dữ liệu",
      profile: "Hồ sơ",
      settings: "Cài đặt",
    },
  },
};

export const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

function resolveTranslation(language, key) {
  return key.split(".").reduce((value, part) => value?.[part], translations[language]);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return resolveTranslation(language, key) ?? resolveTranslation("en", key) ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
