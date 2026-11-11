export type Paal = 'அறத்துப்பால்' | 'பொருட்பால்' | 'காமத்துப்பால்';

export interface Commentaries {
  muVa: string;          // மு. வரதராசனார் (Dr. M. Varadarajan)
  karunanidhi: string;   // கலைஞர் மு. கருணாநிதி (Kalaignar)
  solomon: string;       // சாலமன் பாப்பையா (Solomon Pappaiah)
  parimelazhagar: string;// பரிமேலழகர் (Parimelazhagar)
  english?: string;      // English Translation (G.U. Pope / contemporary)
  englishExplanation?: string;
}

export interface KuralMedia {
  youtubeUrl?: string;
  youtubeTitle?: string;
  imageUrl?: string;
  imageCaption?: string;
  notes?: string;
}

export interface Kural {
  number: number;
  line1: string;
  line2: string;
  transliteration?: string;
  athikaramNumber: number;
  athikaramTamil: string;
  athikaramEnglish: string;
  paal: Paal;
  paalEnglish: string;
  iyalTamil: string;
  iyalEnglish: string;
  commentaries: Commentaries;
  media?: KuralMedia;
}

export interface Athikaram {
  number: number;
  name: string;
  nameEn: string;
  paal: Paal;
  paalEn: string;
  iyal: string;
  iyalEn: string;
  startKural: number;
  endKural: number;
}
