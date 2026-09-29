export default function Logo({ white = false }) {
  return (
    <img
      src={white ? '/logo-white.png' : '/logo.png'}
      alt="스톡코리아 STOCKOREA"
      draggable={false}
    />
  );
}
