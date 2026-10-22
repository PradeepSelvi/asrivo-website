/**
 * Team members configuration
 * Single source of truth for all team information
 * 
 * INSTRUCTIONS:
 * - Use Title Case for names (e.g., "Sivaganesh J")
 * - Qualifications go after a comma (e.g., "Pradeep Kumar M, DCSE")
 * - Use company email addresses (@asrivotech.in)
 * - Match photo filenames to name (lowercase-with-hyphens.jpeg)
 * - Role title should match description content
 */

export interface TeamMember {
  id: string
  name: string
  role: string
  description: string
  image: string
  email: string
  linkedin?: string
  order: number
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'sargunan',
    name: 'Sargunan',
    role: 'Chief Executive Officer',
    description:
      'Sargunan leads Asrivo Tech with a strategic vision for innovation and growth. With extensive experience in technology leadership, he drives the company\'s mission to deliver cutting-edge digital solutions.',
    image: '/team/sargunan.jpeg',
    email: 'sargunan@asrivotech.in', // Company email
    linkedin: '',
    order: 1,
  },
  {
    id: 'aswin',
    name: 'Aswin Anand S',
    role: 'Management Head & HR Manager',
    description:
      'Aswin oversees HR, administration, and finance operations. He ensures organizational excellence in talent management, employee development, and operational efficiency.',
    image: '/team/aswin.jpeg',
    email: 'aswin@asrivotech.in',
    linkedin: '',
    order: 2,
  },
  {
    id: 'pradeep',
    name: 'Pradeep Kumar M, DCSE', // Qualification after comma
    role: 'Legal & Compliance Head', // TODO: Confirm if technical role exists
    description:
      'Pradeep manages legal affairs, regulatory compliance, and risk management. He ensures the company operates within legal frameworks and maintains strong governance standards.',
    image: '/team/pradeep.jpeg',
    email: 'pradeep@asrivotech.in',
    linkedin: '',
    order: 3,
  },
  {
    id: 'sivaganesh',
    name: 'Sivaganesh J', // Title Case
    role: 'Digital Marketing Specialist',
    description:
      'Sivaganesh drives our digital marketing initiatives, specializing in SEO and SMO strategies. He helps clients achieve online visibility and measurable growth through data-driven campaigns.',
    image: '/team/sivaganesh-j.jpeg', // Rename file to match
    email: 'sivaganesh@asrivotech.in',
    linkedin: '',
    order: 4,
  },
  {
    id: 'krishna', // TODO: Confirm spelling - "Krishan" or "Krishna"?
    name: 'Krishna Kumar B K', // TODO: Confirm correct spelling
    role: 'Project Manager & Frontend Developer',
    description:
      'Krishna manages client projects and leads frontend development efforts. He ensures timely delivery and high-quality code while coordinating between design, development, and client teams.',
    image: '/team/krishnakumar.jpeg', // Filename uses "krishna"
    email: 'krishna@asrivotech.in', // Email uses "krishna"
    linkedin: '',
    order: 5,
  },
  {
    id: 'dhanushraj',
    name: 'Dhanushraj M',
    role: 'Backend Developer',
    description:
      'Dhanushraj specializes in server-side development, database architecture, and API design. He builds robust backend systems that power our client applications.',
    image: '/team/dhanushraj.jpeg',
    email: 'dhanushraj@asrivotech.in',
    linkedin: '',
    order: 6,
  },
  {
    id: 'karthik',
    name: 'Karthik Rajalee S', // Title Case
    role: 'Full Stack Developer',
    description:
      'Karthik works across the entire technology stack, building end-to-end solutions. His versatility enables him to contribute to both frontend and backend development.',
    image: '/team/karthik-rajalee.jpeg', // Rename file to match
    email: 'karthik@asrivotech.in',
    linkedin: '',
    order: 7,
  },
  {
    id: 'siranjeevi',
    name: 'Siranjeevi',
    role: 'Full Stack Developer',
    description:
      'Siranjeevi develops comprehensive web applications using modern frameworks. He delivers complete solutions from database to user interface.',
    image: '/team/siranjeevi.jpeg',
    email: 'siranjeevi@asrivotech.in',
    linkedin: '',
    order: 8,
  },
  {
    id: 'krishnamoorthi',
    name: 'Krishnamoorthi V P',
    role: 'Full Stack Developer',
    description:
      'Krishnamoorthi builds scalable web applications with expertise in both frontend and backend technologies. He delivers efficient, maintainable code for complex projects.',
    image: '/team/krishnamoorthi.jpeg',
    email: 'krishnamoorthi@asrivotech.in',
    linkedin: '',
    order: 9,
  },
  {
    id: 'dhanuvel',
    name: 'Dhanuvel A',
    role: 'Full Stack Developer',
    description:
      'Dhanuvel contributes to full-stack development projects, working with modern web technologies to create seamless user experiences backed by solid server architecture.',
    image: '/team/dhanuvel.jpeg',
    email: 'dhanuvel@asrivotech.in',
    linkedin: '',
    order: 10,
  },
]

// Helper functions
export const getTeamMembers = () => TEAM_MEMBERS.sort((a, b) => a.order - b.order)

export const getTeamMemberById = (id: string) => TEAM_MEMBERS.find((m) => m.id === id)

export const getTeamSize = () => TEAM_MEMBERS.length

// TODO List for team configuration:
// 1. Confirm "Krishan" vs "Krishna" spelling with team member
// 2. Rename image files:
//    - sivaganesh j.jpeg → sivaganesh-j.jpeg
//    - karthik rajalee.jpeg → karthik-rajalee.jpeg
//    - KRISHNAKUMAR.jpeg → krishnakumar.jpeg (lowercase)
// 3. Set up company email addresses for all team members
// 4. Confirm Pradeep's role (Legal only, or Legal + Technical?)
// 5. Update all LinkedIn profile URLs
// 6. Remove title attributes from email links (see audit #16)
