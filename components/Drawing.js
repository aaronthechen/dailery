import Image from "next/image"

export default function Drawing({ title, image, date, artist, isown }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-center shadow-lg shadow-gray-500 hover:shadow-md ease-in-out transition duration-300 bg-cover aspect-square bg-[url('/painting.png')]">
        <div className="w-[81.5%] aspect-square rounded-lg">
          <Image
            src={image}
            width={500}
            height={500}
            className="w-full h-full"
            alt="drawing" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-lg"> <span className="italic">{title}</span>, {date}</p>
        <p className="text-lg">By {artist}</p>
      </div>
    </div>
  )
}
