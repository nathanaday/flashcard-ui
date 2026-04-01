import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SetList } from './components/SetList.js';
import { StudySession } from './components/StudySession.js';
import { CardEditor } from './components/CardEditor.js';
import { DPDashboard } from './components/DPDashboard.js';
import { DPStudySession } from './components/DPStudySession.js';
import { DPCategoryGuide } from './components/DPCategoryGuide.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { GlobalThemeToggle } from './components/GlobalThemeToggle.js';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlobalThemeToggle />
        <Routes>
          <Route path="/" element={<SetList />} />
          <Route path="/sets/:id" element={<StudySession />} />
          <Route path="/sets/:id/edit" element={<CardEditor />} />
          <Route path="/dp" element={<DPDashboard />} />
          <Route path="/dp/study/:stage" element={<DPStudySession />} />
          <Route path="/dp/categories" element={<DPCategoryGuide />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
