declare module 'react-slick' {
  import { Component } from 'react'

  interface Settings {
    dots?: boolean
    infinite?: boolean
    speed?: number
    slidesToShow?: number
    slidesToScroll?: number
    arrows?: boolean
    nextArrow?: JSX.Element
    prevArrow?: JSX.Element
    // Add any other settings you use
  }

  export default class Slider extends Component<Settings> {}
}