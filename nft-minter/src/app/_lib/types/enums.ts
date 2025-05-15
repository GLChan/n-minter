
/**
 * 表示 NFT 的通用状态。
 * 这些值可以用于追踪 NFT 从铸造到不同应用场景的生命周期。
 */
export enum NftStatus {
  /**
   * 已铸造 (Minted)
   * NFT 已经被成功创建并记录在区块链上，但可能尚未进行其他操作（如挂单销售或在游戏中使用）。
   * 这通常是 NFT 的初始状态。
   */
  Minted = 'minted',

  /**
   * 挂单销售中 (Listed for Sale)
   * NFT 当前正在市场上以特定价格或通过拍卖等方式挂单出售。
   */
  ListedForSale = 'listed_for_sale',

  /**
   * 已售出 (Sold)
   * NFT 已经成功售出，所有权已转移给新的买家。
   */
  Sold = 'sold',

  /**
   * 游戏内物品 (In-Game Item)
   * NFT 当前正在游戏或其他应用中作为可使用或可交互的物品。
   * 这表示 NFT 可能具有特定的效用或功能。
   */
  InGameItem = 'in_game_item'
}


/**
 * 表示 NFT 的挂单或市场状态。
 * 这些值对应您在 Supabase 数据库中为 `listing_status` 字段定义的 ENUM 类型或 TEXT 值。
 */
export enum NftListingStatus {
  /**
   * 未上架/未挂单
   * NFT 存在于用户的钱包中，但当前未在平台或任何市场上挂单出售。
   * 这是 NFT 的默认状态，或者用户取消挂单后的状态。
   */
  NotListed = 'not_listed',

  /**
   * 固定价格挂单中
   * NFT 正在以一个固定的价格在平台或指定市场上出售。
   */
  ListedFixedPrice = 'listed_fixed_price',

  /**
   * 拍卖中
   * NFT 正在通过拍卖的形式在平台或指定市场上出售。
   */
  ListedAuction = 'listed_auction',

  /**
   * 有出价/有报价
   * NFT 可能未直接挂单，或者已挂单，并且已经收到了一个或多个来自潜在购买者的出价/报价。
   */
  HasOffers = 'has_offers',

  /**
   * 等待出售完成/交易处理中
   * 已经达成了初步的销售协议（例如，拍卖中标，或固定价格订单已创建），
   * 正在等待最终的交易确认（例如，买家付款、区块链交易确认等）。
   */
  PendingSale = 'pending_sale',

  /**
   * 已售出
   * NFT 已经通过平台或追踪的渠道成功售出。
   */
  Sold = 'sold',

  /**
   * 已下架/取消挂单
   * NFT 之前曾被挂单，但已被所有者主动从市场上下架。
   */
  Delisted = 'delisted',

  /**
   * 拍卖结束未售出
   * NFT 的拍卖已结束，但没有达到底价或没有出价者，未能成功售出。
   */
  AuctionEndedNoSale = 'auction_ended_no_sale',

  /**
   * 已质押/已锁定
   * NFT 当前被质押在某个合约中（例如为了获取收益），或者因为其他应用内逻辑（如游戏中使用）
   * 而被暂时锁定，不能进行交易。
   */
  Staked = 'staked', // 或者 'locked'，根据您的具体用词

  /**
   * 草稿/待发布
   * 用户已经开始创建挂单信息，但尚未最终确认并公开发布。
   */
  Draft = 'draft',

  /**
   * 已过期
   * 挂单有时间限制（例如限时拍卖或限时固定价格挂单），在到期后未成功交易的状态。
   */
  Expired = 'expired'
}
