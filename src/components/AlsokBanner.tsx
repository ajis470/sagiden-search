export default function AlsokBanner() {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">広告</span>
      <a href="https://px.a8.net/svt/ejp?a8mat=4B7XX8+79DEFM+3ZES+6MZE9" rel="nofollow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={468}
          height={60}
          alt="ALSOK ホームセキュリティ"
          src="https://www28.a8.net/svt/bgt?aid=260711036439&wid=005&eno=01&mid=s00000018586001115000&mc=1"
          className="max-w-full h-auto border-0"
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        alt=""
        src="https://www15.a8.net/0.gif?a8mat=4B7XX8+79DEFM+3ZES+6MZE9"
        className="hidden"
      />
    </div>
  );
}
