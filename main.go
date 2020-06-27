package main

import (
	"bytes"
	"image"
	_ "image/png"
	"log"

	"github.com/bbrugger/ebidefender/static/sprites"
	"github.com/hajimehoshi/ebiten"
)

const (
	screenWidth  = 800
	screenHeight = 600
)

var grassImage *ebiten.Image

func init() {
	img, _, err := image.Decode(bytes.NewReader(sprites.Grass_32))
	if err != nil {
		log.Fatal(err)
	}

	grassImage, _ = ebiten.NewImageFromImage(img, ebiten.FilterDefault)
}

type Game struct {
	inited bool
	op     ebiten.DrawImageOptions
}

func (g *Game) Update(screen *ebiten.Image) error {
	if !g.inited {
		g.inited = true
	}
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.DrawImage(grassImage, &g.op)
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return screenWidth, screenHeight
}

func main() {
	ebiten.SetWindowSize(screenWidth, screenHeight)
	ebiten.SetWindowTitle("Ebiten Wasm Test")
	if err := ebiten.RunGame(&Game{}); err != nil {
		log.Fatal(err)
	}
}
