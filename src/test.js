console.log(1);

function func() {
  console.info(2);
}

export default class Test {
  say() {
    console.debug(3);
  }
  render() {
    return <div>{console.error(4)}</div>;
  }
}
