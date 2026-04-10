export interface JD {
  role: string;
  co: string;
  bounty: string;
  status: 'Published' | 'Draft' | 'In Review';
  o1: 'Sent' | 'Drafted' | 'Not Started';
  o2: 'Sent' | 'Drafted' | 'Not Started';
  intro: 'Ready' | 'Drafted' | 'Not Started';
  qa: boolean;
}

export const jds: JD[] = [
  {role:'Research Scientist',co:'AfterQuery',bounty:'15%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'GTM Lead',co:'AfterQuery',bounty:'15%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Growth Associate',co:'AfterQuery',bounty:'14%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Tech Strategic Projects Lead',co:'AfterQuery',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Sr SWE Infra & Platform (FS)',co:'AfterQuery',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Tech Deployment Strategist',co:'Trellis AI',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Backend AI Engineer',co:'Trellis AI',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding Sales',co:'Cardinal',bounty:'15.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding Engineer',co:'Cardinal',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding GTM',co:'Cardinal',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Strategic Projects Lead',co:'Bespoke Labs',bounty:'15.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Senior DevOps Engineer',co:'Bespoke Labs',bounty:'20%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Account Executive',co:'AthenaHQ',bounty:'15.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Product Engineer',co:'AthenaHQ',bounty:'17.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Full Stack Engineer',co:'Amari AI',bounty:'18.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Senior Frontend Engineer',co:'Amari AI',bounty:'18.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Buyer, Inventory & Import Spec',co:'Mixed Nuts Inc',bounty:'14.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Growth Marketer',co:'Liquid',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Product Designer',co:'Liquid',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding Sales',co:'TriFetch',bounty:'16.5%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Recommendations Engineer',co:'VRChat',bounty:'17%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Senior Founding Engineer',co:'Bluejay',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding GTM',co:'Bluejay',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding Engineer',co:'foam',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding CTO',co:'Gigi',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Founding Product Designer',co:'Gigi',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Full-Stack Engineer',co:'Kobalt Labs',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Account Executive',co:'BACH',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Design Engineer',co:'Porter',bounty:'18%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Kubernetes Engineer',co:'Porter',bounty:'18%',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Applied AI Engineer',co:'Antes AI',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'LLM Applications Engineer',co:'Uncountable',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Strategy & Ops Fellow',co:'Known',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'ML Engineer Matchmaking',co:'Known',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Software Engineer',co:'Strala',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Growth',co:'Strala',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'SDR',co:'Strala',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
  {role:'Forward Deploy AI Engineer',co:'Judgment Labs',bounty:'—',status:'Published',o1:'Sent',o2:'Sent',intro:'Ready',qa:true},
];
