/**
 * HubSpot's own association type ids (category `HUBSPOT_DEFINED`), for associating records as they're created.
 * Each direction has its own id: a note on a contact is `noteToContact`, never `contactToNote`.
 * From HubSpot's associations v4 reference.
 */
export const ASSOCIATION_TYPES = {
  contactToPrimaryCompany: 1,
  contactToCompany: 279,
  companyToContact: 280,
  contactToDeal: 4,
  dealToContact: 3,
  dealToPrimaryCompany: 5,
  dealToCompany: 341,
  companyToDeal: 342,
  noteToContact: 202,
  noteToCompany: 190,
  noteToDeal: 214,
  contactToNote: 201,
  companyToNote: 189,
  dealToNote: 213,
} as const;
