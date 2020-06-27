package main

import (
	"bytes"
	"image"
	_ "image/png"
	"log"
	"math/rand"

	"github.com/bbrugger/ebidefender/static/sprites"
	"github.com/hajimehoshi/ebiten"
)

const (
	screenWidth  = 800
	screenHeight = 640
	spriteSize   = 32
)

type Sprite []byte

type Tile struct {
	spr *ebiten.Image
}

type Board struct {
	tiles [][]Tile
}

type Game struct {
	inited bool
	op     ebiten.DrawImageOptions
}

var grassImages []*ebiten.Image
var board Board

func init() {
	grassImages = make([]*ebiten.Image, 2)
	grassSprites := []Sprite{
		sprites.Grass_32,
		sprites.Grass_32_2,
	}

	for i := range grassImages {
		img, _, err := image.Decode(bytes.NewReader(grassSprites[i]))
		if err != nil {
			log.Fatal(err)
		}

		grassImages[i], _ = ebiten.NewImageFromImage(img, ebiten.FilterDefault)
	}

	board.tiles = make([][]Tile, screenHeight/spriteSize)
	for i := range board.tiles {
		board.tiles[i] = make([]Tile, screenWidth/spriteSize)
	}

	for r := range board.tiles {
		for c := range board.tiles[r] {
			board.tiles[r][c].spr = grassImages[rand.Intn(len(grassImages))]
		}
	}
}

func (g *Game) Update(screen *ebiten.Image) error {
	if !g.inited {
		g.inited = true
	}
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	for r := range board.tiles {
		for c := range board.tiles[r] {
			g.op.GeoM.Reset()
			g.op.GeoM.Translate(float64(c)*spriteSize, float64(r)*spriteSize)
			screen.DrawImage(board.tiles[r][c].spr, &g.op)
		}
	}
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
