import { Word } from 'react-wordcloud';
import ReactWordcloud from 'react-wordcloud';


type Props = {
  words: Word[]
}

export const WordsCloud = ({words}:Props) => {
  const callbacks = {
    getWordColor: (word: Word) => word.value > 50 ? "blue" : "red",
    onWordClick: (word: Word) => console.log(word),
    onWordMouseOver: (word: Word) => console.log(word),
    getWordTooltip: (word: Word) => `${word.text} (${word.value}) [${word.value > 50 ? "good" : "bad"}]`,
  }
  const options = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
  };
  const size = [600, 400] as [number, number];
  return(
    <div className='w-full h-full bg-transparent'>
        <ReactWordcloud words={words} options={options} callbacks={callbacks} size={size} />
    </div>
  )
}