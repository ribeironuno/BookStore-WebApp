export class LoyaltyInfo {
  constructor(
    public earnedPointsForEachEuro: number,
    public freeShipPoints: number,
    public discountForEach100Points: number,
    public earnedPointsForEachPurchaseUsedBook: number,
    public infantilAge: number,
    public juvenilAge: number,
    public adultAge: number,
    public seniorAge: number,
    public shipCost: number
  ) {}
}
