// NFT 市场销售状态 (NftMarketStatus)
export enum NFTMarketStatus {
  /**
   * 未上架 (Not Listed)
   * NFT 在用户钱包中，但未主动以固定价格或拍卖形式出售。
   * 这也可能是拍卖结束未成交、过期或卖家主动下架后的状态。
   */
  NotListed = 'NotListed',

  /**
   * 固定价格出售 (Listed - Fixed Price)
   * NFT 以设定的“立即购买”价格正在出售。
   */
  ListedFixedPrice = 'ListedFixedPrice',

  /**
   * 拍卖中 (Listed - Auction)
   * NFT 正在通过限时拍卖的形式出售。
   * (注意:  主要支持英式拍卖，即价格向上竞拍)
   */
  ListedAuction = 'ListedAuction',

  /**
   * 为特定买家保留 (Reserved for Specific Buyer)
   * NFT 已上架，但设置为仅供特定钱包地址购买（私下销售）。
   */
  ReservedForBuyer = 'ReservedForBuyer',

  /**
   * 上架已过期 (Expired Listing)
   * NFT 的上架销售期限已到，但未成功售出。
   */
  ExpiredListing = 'ExpiredListing',

  /**
   * 非活跃上架 (Inactive Listing)
   * 指一个曾经的上架记录（通常是固定价格）没有被正确取消，
   * 理论上如果物品被转回原钱包，该上架仍可能被满足。
   * 这种情况需要用户手动取消以确保安全。
   */
  InactiveListing = 'InactiveListing',
}

// 2. NFT 可见性状态 (NftVisibilityStatus)
export enum NFTVisibilityStatus {
  /**
   * 可见 (Visible)
   * NFT 正常显示，可以在平台上被搜索和查看。这是默认状态。
   */
  Visible = 'Visible',

  /**
   * 被用户隐藏 (Hidden By User)
   * NFT 的所有者选择从其公开的  个人资料中隐藏此项目。
   * 其他人可能无法直接看到，但 NFT 仍在所有者钱包中。
   */
  HiddenByUser = 'HiddenByUser',

  /**
   * 被  下架/内容不可用 (Delisted by  / Content Not Available)
   * 由于违反服务条款、版权问题或其他原因， 已将此 NFT 从平台移除或限制其可见性。
   * NFT 本身仍在区块链上，但在  上可能无法交易或查看。
   */
  DelistedByPlatform = 'DelistedByPlatform',
}

// 3. NFT 拍卖子状态 (NftAuctionSubState)
export enum NftAuctionSubState {
  /**
   * 接受出价 (Accepting Bids)
   * 拍卖正在进行中，可以接受新的出价。
   */
  AcceptingBids = 'AcceptingBids',

  /**
   * 未达到底价 (Reserve Price Not Met)
   * 拍卖已结束（或正在结束），但出价未达到卖家设定的底价。
   * （注意：这通常是拍卖结束后的一个结果状态，而不是进行中的状态）
   */
  ReserveNotMet = 'ReserveNotMet',

  /**
   * 拍卖即将结束 (Auction Ending Soon)
   *  界面可能会提示拍卖即将在短时间内结束。
   */
  EndingSoon = 'EndingSoon',

  /**
   * 拍卖已成功结束 (Auction Ended Successfully)
   * 拍卖结束，有中标者，NFT 正在或等待转移。
   * （这通常会使NFT市场状态变为 NotListed 或进入转移流程）
   */
  EndedSuccessfully = 'EndedSuccessfully',

  /**
  * 拍卖未成功结束 (Auction Ended Unsuccessfully)
  * 拍卖结束，但没有成功交易（例如无人出价或未达底价）。
  * （这通常会使NFT市场状态变为 NotListed 或 ExpiredListing）
  */
  EndedUnsuccessfully = 'EndedUnsuccessfully',
}

// 交易的当前状态
export enum TransactionStatus {
  /**
   * 待处理 (Pending)
   * 交易已提交到区块链网络，但尚未被矿工打包确认。
   * 这是交易的初始状态。
   */
  Pending = 'Pending',

  /**
   * 成功/已完成 (Successful / Completed)
   * 交易已在区块链上成功确认和执行。
   * 相关的资产转移（如 NFT 所有权、资金支付）已完成。
   */
  Successful = 'Successful',

  /**
   * 失败/已回滚 (Failed / Reverted)
   * 交易在区块链上执行失败。
   * 原因可能包括：Gas 不足、智能合约逻辑错误导致回滚、超出区块 Gas 限制等。
   * 资产状态通常会恢复到交易之前的状态（除了消耗的 Gas）。
   */
  Failed = 'Failed',

  /**
   * 已取消 (Cancelled)
   * 用户（通常是发起方，即 seller_address 或 buyer_address，取决于交易类型）
   * 主动发起了一个取消操作，并且该取消操作成功地阻止了原始交易的执行。
   * 这通常是通过发送一个具有相同 nonce 但更高 Gas 价格的空交易或替代交易来实现的。
   * (注意: 并非所有交易都容易被取消，且取消本身也是一笔交易)
   */
  Cancelled = 'Cancelled',

  /**
   * (可选) 等待确认中/处理中 (Confirming / Processing)
   * 交易已获得一些区块确认，但你的应用可能需要更多数量的确认才认为其“最终安全”。
   * 或者，链上交易已成功，但你的后端正在进行相关的后续处理（如更新其他数据、发送通知等）。
   * 如果不需要这种细粒度，可以直接从 Pending 到 Successful/Failed。
   */
  // Confirming = 'Confirming',
}

export enum TransactionType {
  Mint = 'MINT',        // NFT 铸造
  List = 'LIST',      // NFT 上架
  Sale = 'SALE',        // NFT 销售 (你目前表结构主要针对的就是这个)
  Transfer = 'TRANSFER',  // NFT 直接转移 (非销售)
  Unlist = 'UNLIST',      // NFT 下架
  // 可以根据需要扩展，例如：Offer, CancelOffer 等，如果这些操作也作为独立的交易记录的话
}

export enum SORT_OPTIONS {
  RECENT_LISTED = 'recent_listed',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RECENT_CREATED = 'recent_created',
}