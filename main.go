package main

import (
	"fmt"
	"syscall/js"
)

func add(this js.Value, i []js.Value) interface{} {
	return js.ValueOf(i[0].Int() + i[1].Int())
}

func registerCallbacks() {
	js.Global().Set("add", js.FuncOf(add))
}

func main() {
	c := make(chan struct{}, 0)

	fmt.Println("Initializing Go WASM...")
	registerCallbacks()
	fmt.Println("Go WASM initialized!")

	<-c
}
