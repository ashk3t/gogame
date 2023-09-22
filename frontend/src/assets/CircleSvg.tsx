export default function CircleSvg(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      stroke="currentColor"
      {...props}
    >
      <circle cx="50" cy="50" r="50" />
    </svg>
  )
}