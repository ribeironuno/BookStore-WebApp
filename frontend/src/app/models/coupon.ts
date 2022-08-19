export class Coupon {
  constructor(
    public code: string,
    public initialDate: string,
    public expiredDate: String,
    public percentageToDiscount: number
  ) {}
}
