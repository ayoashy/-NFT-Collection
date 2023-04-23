// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.token;
  const name = `CryptoDev ${tokenId}`;
  const description = 'CryptoDev is an NFT-Collection for Web3 developers';
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${
    Number(tokenId) - 1
  }.svg`;
  res.status(200).json({ name, description, image });
}
