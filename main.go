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
	screenWidth  = 832
	screenHeight = 640
	spriteSize   = 64
)

type Sprite []byte

type Frame struct {
	rect     image.Rectangle
	duration int
}

type Animation struct {
	sprSheet     *ebiten.Image
	frames       []Frame
	updateCount  int
	currentFrame int
}

func (a *Animation) getCurrentImage() *ebiten.Image {
	img, _ := ebiten.NewImageFromImage(
		a.sprSheet.SubImage(a.frames[a.currentFrame].rect),
		ebiten.FilterDefault,
	)
	return img
}

func (a *Animation) update() {
	a.updateCount++
	if a.updateCount == a.frames[a.currentFrame].duration {
		a.currentFrame = (a.currentFrame + 1) % len(a.frames)
		a.updateCount = 0
	}
}

type Position struct {
	X int
	Y int
}

type Character struct {
	position Position
	anim     Animation
}

type Tile struct {
	floor *ebiten.Image
}

type Board struct {
	tiles  [][]Tile
	height int
	width  int
}

type Game struct {
	inited bool
	op     ebiten.DrawImageOptions
}

var grassImages []*ebiten.Image
var linkImage *ebiten.Image
var shadowImage *ebiten.Image

var board Board
var hero Character

func loadImages() {
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

	img, _, err := image.Decode(bytes.NewReader(sprites.Link_64))
	if err != nil {
		log.Fatal(err)
	}
	linkImage, _ = ebiten.NewImageFromImage(img, ebiten.FilterDefault)

	img, _, err = image.Decode(bytes.NewReader(sprites.Shadow_64))
	if err != nil {
		log.Fatal(err)
	}
	shadowImage, _ = ebiten.NewImageFromImage(img, ebiten.FilterDefault)
}

func initBoard() {
	board.height = screenHeight / spriteSize
	board.width = screenWidth / spriteSize

	board.tiles = make([][]Tile, screenHeight/spriteSize)
	for i := range board.tiles {
		board.tiles[i] = make([]Tile, screenWidth/spriteSize)
	}

	for r := range board.tiles {
		for c := range board.tiles[r] {
			board.tiles[r][c].floor = grassImages[rand.Intn(len(grassImages))]
		}
	}
}

func initHero() {
	middleRow := screenHeight / (2 * spriteSize)
	middleColumn := screenWidth / (2 * spriteSize)
	hero.position = Position{middleColumn, middleRow}
	hero.anim = Animation{
		sprSheet: linkImage,
		frames: []Frame{
			{rect: image.Rectangle{image.Point{0, 0}, image.Point{64, 64}}, duration: 20},
			{rect: image.Rectangle{image.Point{64, 0}, image.Point{128, 64}}, duration: 20},
		},
	}
}

func init() {
	loadImages()
	initBoard()
	initHero()
}

func (g *Game) Update(screen *ebiten.Image) error {
	if !g.inited {
		g.inited = true
	}
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	// Draw board tiles
	for r := range board.tiles {
		for c := range board.tiles[r] {
			g.op.GeoM.Reset()
			g.op.GeoM.Translate(float64(c)*spriteSize/2, float64(r)*spriteSize/2)
			g.op.GeoM.Scale(2.0, 2.0)
			screen.DrawImage(board.tiles[r][c].floor, &g.op)
		}
	}

	// Draw hero
	g.op.GeoM.Reset()
	g.op.GeoM.Translate(float64(hero.position.X)*spriteSize, float64(hero.position.Y)*spriteSize)
	screen.DrawImage(shadowImage, &g.op)
	screen.DrawImage(hero.anim.getCurrentImage(), &g.op)
	hero.anim.update()
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
