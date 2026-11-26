// TODO: fill the bracketed placeholders before publishing the app, they are shown as is
const PUBLISHERS = '[À compléter : prénoms et noms des éditeurs]';
const CONTACT = '[À compléter : adresse email de contact]';
const HOSTING_REGION = '[À compléter : région du projet Supabase, par exemple Union européenne (Francfort)]';
const UPDATED_ON = '26 novembre 2026';

export type LegalPage = 'mentions' | 'confidentialite';

export type LegalSection = { title: string; paragraphs: string[] };

export type LegalDocument = { title: string; updatedOn: string; sections: LegalSection[] };

export const LEGAL_DOCUMENTS: Record<LegalPage, LegalDocument> = {
  mentions: {
    title: 'Mentions légales',
    updatedOn: UPDATED_ON,
    sections: [
      {
        title: 'Éditeur',
        paragraphs: [
          `ScannBook est un projet étudiant non commercial, édité par ${PUBLISHERS}.`,
          `Contact : ${CONTACT}.`,
          `Directeurs de la publication : ${PUBLISHERS}.`,
        ],
      },
      {
        title: 'Hébergement',
        paragraphs: [
          `Les comptes et les bibliothèques sont hébergés par Supabase, Inc. (supabase.com), dans la région ${HOSTING_REGION}.`,
          'Les fiches des livres proviennent de l’API Google Books, fournie par Google LLC.',
        ],
      },
      {
        title: 'Propriété intellectuelle',
        paragraphs: [
          'Le code, le design et les textes de ScannBook appartiennent à leurs auteurs. Les titres, résumés et couvertures des livres restent la propriété de leurs éditeurs et sont affichés à titre d’information.',
        ],
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    updatedOn: UPDATED_ON,
    sections: [
      {
        title: 'Responsables du traitement',
        paragraphs: [`${PUBLISHERS}, joignables à ${CONTACT}.`],
      },
      {
        title: 'Ce que nous enregistrons',
        paragraphs: [
          'Ton adresse email et ton mot de passe, stocké chiffré par Supabase : ils servent à te connecter.',
          'Ton prénom et ton nom, seulement si tu les ajoutes dans ton profil.',
          'Les livres que tu ranges : ISBN, titre, auteurs, couverture et informations de la fiche, pile, page en cours et dates de lecture.',
          'Rien d’autre : pas de publicité, pas de mesure d’audience, pas de géolocalisation.',
        ],
      },
      {
        title: 'La caméra',
        paragraphs: [
          'La caméra sert uniquement à lire le code-barres, directement sur ton téléphone. Aucune photo ni vidéo n’est enregistrée ou envoyée.',
        ],
      },
      {
        title: 'Pourquoi et sur quelle base',
        paragraphs: [
          'Ces données servent uniquement à faire fonctionner ton compte et ta bibliothèque. Le traitement repose sur l’exécution du service que tu as demandé en créant un compte (article 6.1.b du RGPD).',
        ],
      },
      {
        title: 'Qui y a accès',
        paragraphs: [
          `Supabase héberge les données (région ${HOSTING_REGION}). Chaque compte ne peut lire que ses propres livres.`,
          'Quand tu scannes ou cherches un livre, son ISBN est envoyé à Google Books pour récupérer la fiche. Google reçoit aussi l’adresse IP de ton téléphone, comme pour toute requête internet.',
          'Tes données ne sont ni vendues ni partagées avec quiconque d’autre.',
        ],
      },
      {
        title: 'Combien de temps',
        paragraphs: [
          'Tes données sont gardées tant que ton compte existe. Quand le compte est supprimé, tous tes livres sont supprimés avec lui.',
        ],
      },
      {
        title: 'Tes droits',
        paragraphs: [
          `Tu peux accéder à tes données, les corriger, les exporter, t’opposer à leur traitement ou demander la suppression de ton compte en écrivant à ${CONTACT}. Nous répondons sous un mois.`,
          'Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une réclamation à la CNIL (cnil.fr).',
        ],
      },
      {
        title: 'Sur ton téléphone',
        paragraphs: [
          'L’app garde ta session de connexion et le fait que tu as vu la présentation, pour ne pas te les redemander. Ces informations restent sur ton téléphone et disparaissent à la déconnexion ou à la désinstallation.',
        ],
      },
    ],
  },
};
