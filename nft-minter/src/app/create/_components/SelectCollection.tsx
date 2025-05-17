import { getCollectionByUserId, getCurrentUser } from "@/app/_lib/data-service"

export default async function SelectCollection({ name, id, defaultValue }: { name: string, id: string, defaultValue: string }) {

  // const user = await getCurrentUser()
  // if (!user) {
  //   return <div>用户未登录</div>;
  // }
  // const collections = await getCollectionByUserId(user.id)

  // console.log('collections', collections)

  return (
    <select
      id={id}
      name={name}
      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      defaultValue={defaultValue}
    >
      <option value="">不添加到合集</option>
      <option value="digital-life">数字生活系列</option>
      <option value="abstract-art">抽象艺术</option>
    </select>
  )
}