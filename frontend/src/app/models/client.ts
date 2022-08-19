interface personalInformation {
  name: string;
  gender: string;
  dob: string;
  cellPhone: number;
  address: string;
  city: string;
  zip: string;
  nif: number;
  email: string;
  password: string;
}

interface loyaltySystem {
  creationMemberDate: string;
  booksSold: number;
  booksPurchased: number;
  totalMoneySold: number;
  totalMoneyPurchased: number;
  atualPoints: number;
}

export class Client {
  constructor(
    public personalInformation: personalInformation,
    public loyaltySystem: loyaltySystem
  ) {}
}

export class NewsletterSubscriber {
  constructor(public name: string, public email: string) {}
}
