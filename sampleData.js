export const PROCESS_STEPS = [
  'Project Allocation',
  'Sharing Checklist',
  ' kick-off meeting with Client, MEP and Architect',
  'Data Collation  from Client, MEP and Architect',
  'Application for EC',
  'Check Demand note for MPCB for scrutiny fee payment',
  'Client Intimation &uploading of payment o site',
  'intimation for MPCB Site visit and report',
  'MPCB report uploading on Parivesh',
  'PPT preperation',
  'Mock PPT with All stakeholders',
  'Listing on SEAC-2   Agenda',
  'Intimation for Scrutiny Fee Payment as soon as Agenda',
  'Submissions  to SEAC-2 Committee',
  'SEAC-2 Hearing',
  'Compliance/ PPT- SEAC II in case of ADS incase of absent or deferred case',
  'MOM SEAC-2',
  'SEIAA Complicance submissions',
  'SEAIAA Mom',
  'Final EC'
];

export const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

export function createSteps() {
  return PROCESS_STEPS.map((activity, index) => ({
    id: `step-${index + 1}`,
    srNo: index + 1,
    activity,
    responsibility: index === 3 ? 'Client, MEP and Architect' : index % 3 === 0 ? 'Client' : index % 3 === 1 ? 'MEP' : 'Architect',
    status: index < 3 ? 'Completed' : index === 3 ? 'In Progress' : 'Not Started',
    startDate: index < 4 ? `2026-05-${String(index + 1).padStart(2, '0')}` : '',
    endDate: index < 3 ? `2026-05-${String(index + 3).padStart(2, '0')}` : '',
    remarks: '',
    collation: index === 3 ? ['Architect Data', 'MEP Data', 'Client Data'].map(name => ({ name, status: 'Not Started', startDate: '', endDate: '', remarks: '' })) : null
  }));
}

export const seedProjects = [
  {
    code: 'YRBH03',
    clientName: 'Bhumi Homes',
    projectOwner: 'Chinmay',
    mepInitial: 'YR',
    architectInitial: 'BH',
    projectName: 'Bhumi Heights EC',
    location: 'Mumbai',
    createdAt: '2026-05-01',
    steps: createSteps()
  }
];
