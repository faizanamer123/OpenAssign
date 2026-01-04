/**
 * AssignDump Content Library
 * Professional content for the AssignDump educational platform
 * https://assigndump.com/
 */

export const homepageContent = {
  hero: {
    headline: "Get Help with Assignments, Help Others, Earn Rewards",
    subheadline:
      "Join an anonymous student community where you can upload assignments for quick solutions, review peer work, earn points and badges, and compete on the leaderboard—all while staying completely anonymous and secure.",
  },
  features: [
    {
      title: "Anonymous Assignment Upload",
      description:
        "Upload your assignments completely anonymously. Get help from talented students in our community without revealing your identity. Your privacy is our priority.",
      icon: "Upload",
    },
    {
      title: "Quick Community Solutions",
      description:
        "Receive expert solutions from community members fast. Our active student network ensures you get quality help when you need it most.",
      icon: "Zap",
    },
    {
      title: "Review & Rate Solutions",
      description:
        "Help maintain quality by reviewing and rating other students' solutions. Provide constructive feedback and build your reputation as a helpful community member.",
      icon: "Star",
    },
    {
      title: "Earn Points & Badges",
      description:
        "Solve assignments to earn points and unlock achievement badges. Track your progress and see your contributions recognized on your profile.",
      icon: "Trophy",
    },
    {
      title: "Leaderboard Competition",
      description:
        "Compete with other students on our real-time leaderboard. Climb the ranks by consistently helping others and earning positive ratings.",
      icon: "TrendingUp",
    },
  ],
};

export const faqContent = [
  {
    question: "How does anonymity work on AssignDump?",
    answer:
      "Your identity is completely protected! All users have unique anonymous usernames, and no personal information is shared publicly. You can upload assignments, submit solutions, and review work without revealing who you are. Your email is only used for account verification and notifications.",
  },
  {
    question: "How do I upload an assignment?",
    answer:
      "Click the 'Upload' button in the header or navigate to the Upload page. Add a title, description, upload your assignment files, and optionally set a deadline. Your assignment will be visible to the community, and you'll receive notifications when someone submits a solution.",
  },
  {
    question: "How do I earn points and badges?",
    answer:
      "You earn points by solving assignments and receiving positive ratings on your solutions. Each solution you submit earns you points, and higher ratings give you bonus points. Badges are unlocked for milestones like solving 10 assignments, reaching top 100 on the leaderboard, or consistently getting 5-star ratings.",
  },
  {
    question: "How do I review and rate solutions?",
    answer:
      "Go to any assignment page and scroll to the submissions section. Click on a solution to view it, then use the star rating system (1-5 stars) to rate it. You can also leave comments to provide constructive feedback. Your reviews help maintain quality and help other students find the best solutions.",
  },
  {
    question: "Is AssignDump safe and secure?",
    answer:
      "Yes! AssignDump is designed with your safety in mind. All content is community-moderated through our rating system. Low-rated solutions are flagged, and we have reporting mechanisms in place. Your personal information is never shared, and all interactions are anonymous. We also have community guidelines to ensure a positive learning environment.",
  },
  {
    question: "What file types can I upload?",
    answer:
      "You can upload PDF, DOC, DOCX files, and common image formats (JPG, PNG). Files must be under 10MB. If you're having trouble uploading, check your file size and format, ensure you have a stable internet connection, and try refreshing the page.",
  },
  {
    question: "How does the leaderboard work?",
    answer:
      "The leaderboard shows the top contributors ranked by points. Your rank updates in real-time as you earn points from solving assignments and receiving ratings. You can view it by clicking 'Leaderboard' in the navigation. Climb the ranks by consistently helping others with quality solutions!",
  },
  {
    question: "What if I don't receive the OTP code for login?",
    answer:
      "If you don't receive the OTP code, check your spam/junk folder first. Wait a minute before requesting a new one, as codes may take a moment to arrive. Make sure you're using the same email you registered with. If the problem persists, try logging out and back in, or clear your browser cache.",
  },
];

export const chatbotScript = {
  upload: {
    question: "How to upload assignments",
    answer:
      "To upload an assignment, click the 'Upload' button in the header or go to the Upload page. You can upload files anonymously, add a title and description, and set a deadline. Your assignment will be visible to the community, and you'll receive notifications when someone submits a solution!",
  },
  anonymity: {
    question: "How anonymity works",
    answer:
      "Your identity is completely protected on AssignDump! All users have unique anonymous usernames, and no personal information is shared. You can upload assignments, submit solutions, and review work without revealing who you are. Your email is only used for account verification and notifications.",
  },
  points: {
    question: "How points and badges are earned",
    answer:
      "You earn points by solving assignments and getting positive ratings on your solutions! Each solution you submit earns you points, and higher ratings give you bonus points. You can also earn badges for milestones like solving 10 assignments, reaching top 100 on the leaderboard, or getting 5-star ratings. Check your profile to see your progress!",
  },
  review: {
    question: "How to review solutions",
    answer:
      "To review a solution, go to any assignment page and scroll to the submissions section. Click on a solution to view it, then use the star rating system (1-5 stars) to rate it. You can also leave comments to provide constructive feedback. Your reviews help maintain quality and help other students find the best solutions!",
  },
  safety: {
    question: "Safety and community quality",
    answer:
      "AssignDump is designed with your safety in mind! All content is community-moderated through our rating system. Low-rated solutions are flagged, and we have reporting mechanisms in place. Your personal information is never shared, and all interactions are anonymous. We also have community guidelines to ensure a positive learning environment for everyone.",
  },
  troubleshooting: {
    upload: "If you're having trouble uploading, make sure your file is under 10MB and in a supported format (PDF, DOC, DOCX, images). Check your internet connection and try refreshing the page. If the problem persists, try logging out and back in, or clear your browser cache.",
    login: "To sign in, enter your email address and you'll receive a 6-digit OTP code via email. Enter the code to verify and access your account. If you don't receive the OTP, check your spam folder and wait a minute before requesting a new one. Make sure you're using the same email you registered with.",
  },
};

export const chatbotFallback =
  "I'm not sure I understand that question. Could you rephrase it? I can help with uploading assignments, anonymity, points and badges, reviewing solutions, safety, troubleshooting, or general questions about AssignDump. Try asking something like 'How do I upload an assignment?' or 'How does anonymity work?'";

