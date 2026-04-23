// Realistic dummy resume data used for template previews
const dummyResumeData = {
  _id: "preview",
  title: "Preview Resume",
  template: "classic",
  accent_color: "#3b82f6",
  public: false,

  personal_info: {
    image: "",
    full_name: "Alex Johnson",
    profession: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    website: "alexjohnson.dev",
  },

  professional_summary:
    "Results-driven software engineer with 6+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud architecture. Led a team of 5 engineers to deliver a platform serving 2M+ users.",

  experience: [
    {
      company: "TechCorp Inc.",
      position: "Senior Software Engineer",
      start_date: "2022-01",
      end_date: "",
      description:
        "Led frontend architecture migration to React 18. Reduced page load times by 40%. Mentored 3 junior developers.",
      is_current: true,
    },
    {
      company: "StartupXYZ",
      position: "Full Stack Developer",
      start_date: "2019-06",
      end_date: "2021-12",
      description:
        "Built RESTful APIs serving 500K daily requests. Implemented CI/CD pipelines reducing deployment time by 60%.",
      is_current: false,
    },
  ],

  education: [
    {
      institution: "Stanford University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduation_date: "2019-05",
      gpa: "3.8",
    },
  ],

  project: [
    {
      name: "CloudSync Platform",
      type: "Web Application",
      description:
        "Real-time collaboration platform with WebSocket integration, used by 10K+ teams.",
      link: "https://cloudsync.dev",
    },
  ],

  skills: [
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "AWS",
    "Docker",
    "PostgreSQL",
    "GraphQL",
  ],

  certification: [
    {
      certificate_name: "AWS Solutions Architect",
      description: "Professional cloud architecture certification",
      issuer: "Amazon Web Services",
      issue_date: "2023-03",
      credential_url: "https://aws.amazon.com/certification",
    },
  ],
};

export default dummyResumeData;
