'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface GridSquare {
  x: number
  y: number
  originalSize: number
  phaseOffset: number
  frequency: number
  hasBeenHovered: boolean
  strokeColor: string
  letter?: string
}

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = window.innerWidth
    const height = window.innerHeight
    const squareSize = 50
    const gap = 7
    const maxDistance = 100
    const maxScale = 1.5
    const breatheScale = 1.05

    // Calculate grid dimensions
    const cols = Math.floor(width / (squareSize + gap))
    const rows = Math.floor(height / (squareSize + gap))
    const totalWidth = cols * (squareSize + gap) - gap
    const totalHeight = rows * (squareSize + gap) - gap
    const offsetX = (width - totalWidth) / 2
    const offsetY = (height - totalHeight) / 2

    // Create grid occupancy map
    const gridMap: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false))

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .style('background-color', '#111')

    // Add defs with font style
    svg.append('defs')
      .append('style')
      .attr('type', 'text/css')
      .text(`
        @font-face {
          font-family: 'HomeVideoBold';
          src: url('/fonts/HomeVideoBold.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'HomeVideo';
          src: url('/fonts/HomeVideo.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `)

    // Create data for the grid (without letters)
    const gridData: GridSquare[] = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() < 0.69) {
          gridData.push({
            x: offsetX + j * (squareSize + gap),
            y: offsetY + i * (squareSize + gap),
            originalSize: squareSize,
            phaseOffset: Math.random() * Math.PI * 2,
            frequency: 0.3,
            hasBeenHovered: false,
            strokeColor: getRandomToxicGreen()
          })
          gridMap[i][j] = true
        }
      }
    }

    // Draw squares first
    const squares = svg.selectAll('rect')
      .data(gridData)
      .join('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', '#000000')
      .attr('stroke', () => getRandomToxicGreen())
      .attr('stroke-width', '2')
      .style('transform-origin', d => `${d.x + squareSize/2}px ${d.y + squareSize/2}px`)
      .style('transform', 'scale(1)')
      .style('transition', 'transform 0.2s ease-out')

    // Add text words separately
    const words = [
      { text: 'DES', row: 0, 'font-family': 'HomeVideoBold'},
      { text: 'PROJECTS', row: 2, 'font-family': 'HomeVideo'},
      { text: 'ABOUT', row: 4, 'font-family': 'HomeVideo'},
      { text: 'KYIV', row: 6, 'font-family': 'HomeVideo'},
      { text: '2024', row: 8, 'font-family': 'HomeVideoBold'}
    ]

    // Create groups for each word to handle hover
    words.forEach(word => {
      const letters = word.text.split('')
      const wordGroup = svg.append('g')
        .attr('class', 'word-group')
        .style('cursor', 'pointer')

      letters.forEach((letter, i) => {
        wordGroup.append('text')
          .attr('x', offsetX + i * (squareSize + gap) + squareSize/2)
          .attr('y', offsetY + word.row * (squareSize + gap) + squareSize/2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .style('font-family', word['font-family'])
          .style('font-size', '46px')
          .style('fill', '#00ff00')
          .text(letter)
      })

      // Add hover effect to the word group
      wordGroup
        .on('mouseenter', function() {
          d3.select(this)
            .selectAll('text')
            .transition()
            .duration(200)
            .style('fill', '#ff0000')
        })
        .on('mouseleave', function() {
          d3.select(this)
            .selectAll('text')
            .transition()
            .duration(200)
            .style('fill', '#00ff00')
        })
    })

    // Create multiple roaming squares (1 to 5)
    const numRoamingSquares = Math.floor(Math.random() * 5) + 1
    const roamingSquares = []

    for (let i = 0; i < numRoamingSquares; i++) {
      let roamingPos = findRandomEmptySpot(gridMap)
      
      if (roamingPos) {
        gridMap[roamingPos.row][roamingPos.col] = true

        const roamingSquare = {
          element: svg.append('rect')
            .attr('width', squareSize)
            .attr('height', squareSize)
            .attr('fill', '#000000')
            .attr('stroke', '#FFA500')
            .attr('stroke-width', '2')
            .style('transform-origin', 'center')
            .style('transition', 'all 0.2s ease-out')
            .attr('x', offsetX + roamingPos.col * (squareSize + gap))
            .attr('y', offsetY + roamingPos.row * (squareSize + gap)),
          position: roamingPos
        }

        roamingSquares.push(roamingSquare)
      }
    }

    // Add explosion effect function
    function createExplosion(x: number, y: number) {
      const numParticles = 20
      const particles = []
        console.log('explosion')
      // Create explosion particles
      for (let i = 0; i < numParticles; i++) {
        const angle = (Math.PI * 2 * i) / numParticles
        const velocity = 5 + Math.random() * 5
        
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1
        })
      }

      // Add particles to SVG
      const explosionGroup = svg.append('g')
      
      const particleElements = explosionGroup
        .selectAll('circle')
        .data(particles)
        .join('circle')
        .attr('r', 2)
        .attr('fill', '#ff0000')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      // Animate particles
      function animateExplosion() {
        particles.forEach((p, i) => {
          p.x += p.vx
          p.y += p.vy
          p.life -= 0.02
          p.vy += 0.2 // gravity
        })

        particleElements
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('opacity', d => d.life)

        if (particles[0].life > 0) {
          requestAnimationFrame(animateExplosion)
        } else {
          explosionGroup.remove()
        }
      }

      animateExplosion()
    }

    // Update movement logic
    function moveRoamingSquares() {
      // Check for collisions between roaming squares
      for (let i = 0; i < roamingSquares.length; i++) {
        for (let j = i + 1; j < roamingSquares.length; j++) {
          const square1 = roamingSquares[i]
          const square2 = roamingSquares[j]
          
          // Check if squares are in adjacent cells (including diagonals)
          const rowDiff = Math.abs(square1.position.row - square2.position.row)
          const colDiff = Math.abs(square1.position.col - square2.position.col)
          
          if (rowDiff <= 1 && colDiff <= 1) {  // This checks for adjacent cells including diagonals
            // Create explosion at midpoint
            const explosionX = offsetX + (square1.position.col + square2.position.col) * (squareSize + gap) / 2
            const explosionY = offsetY + (square1.position.row + square2.position.row) * (squareSize + gap) / 2
            
            createExplosion(explosionX, explosionY)

            // Remove colliding squares
            square1.element.remove()
            square2.element.remove()
            
            // Update grid map
            gridMap[square1.position.row][square1.position.col] = false
            gridMap[square2.position.row][square2.position.col] = false
            
            // Remove from roamingSquares array
            roamingSquares.splice(j, 1)
            roamingSquares.splice(i, 1)
            return // Exit after handling collision
          }
        }
      }

      roamingSquares.forEach(roaming => {
        const directions = [
          { row: -1, col: 0 },
          { row: 1, col: 0 },
          { row: 0, col: -1 },
          { row: 0, col: 1 }
        ]

        gridMap[roaming.position.row][roaming.position.col] = false

        const validMoves = directions.filter(dir => {
          const newRow = roaming.position.row + dir.row
          const newCol = roaming.position.col + dir.col
          return (
            newRow >= 0 && newRow < rows &&
            newCol >= 0 && newCol < cols &&
            !gridMap[newRow][newCol]
          )
        })

        if (validMoves.length > 0) {
          const move = validMoves[Math.floor(Math.random() * validMoves.length)]
          const newRow = roaming.position.row + move.row
          const newCol = roaming.position.col + move.col
          
          roaming.position = { row: newRow, col: newCol }
          gridMap[newRow][newCol] = true
          
          // Use transition for smooth movement
          roaming.element
            .transition()
            .duration(200) // Match the interval timing
            .ease(d3.easeLinear)
            .attr('x', offsetX + newCol * (squareSize + gap))
            .attr('y', offsetY + newRow * (squareSize + gap))
        } else {
          gridMap[roaming.position.row][roaming.position.col] = true
        }
      })
    }

    // Helper functions
    function getRandomToxicGreen() {
      const r = Math.floor(Math.random() * 150)
      const g = 255
      const b = Math.floor(Math.random() * 150)
      return `rgb(${r}, ${g}, ${b})`
    }

    function findRandomEmptySpot(grid: boolean[][]): { row: number, col: number } | null {
      const emptySpots = []
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!grid[i][j]) {
            emptySpots.push({ row: i, col: j })
          }
        }
      }
      return emptySpots.length > 0 
        ? emptySpots[Math.floor(Math.random() * emptySpots.length)]
        : null
    }

    // Breathing animation
    let animationFrame: number
    let startTime = performance.now()

    // Add hover scale to track hover state
    squares.each(function(d: any) {
      d.hoverScale = 1  // Add initial hover scale
    })

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      
      squares.each(function(d: any) {
        if (!d.hasBeenHovered) return
        
        const square = d3.select(this)
        const breatheValue = Math.sin((elapsed * 0.001 * d.frequency) + d.phaseOffset)
        const baseScale = (d.hoverScale || 1) + (breatheValue * 0.02)
        square.style('transform', `scale(${baseScale})`)
      })
      
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    // Create a ref to store the closest square
    let currentClosestSquare: {
      square: d3.Selection<any, any, any, any>
      data: any
      distance: number
      col: number
      row: number
    } | null = null

    // Handle mouse movement
    function handleMouseMove(event: MouseEvent) {
      const mouseX = event.clientX
      const mouseY = event.clientY

      // Find the closest square to the cursor
      let minDistance = Infinity
      
      squares.each(function(d: any) {
        const centerX = d.x + squareSize/2
        const centerY = d.y + squareSize/2
        
        const distance = Math.sqrt(
          Math.pow(mouseX - centerX, 2) + 
          Math.pow(mouseY - centerY, 2)
        )

        if (distance < minDistance) {
          minDistance = distance
          currentClosestSquare = { 
            square: d3.select(this), 
            data: d, 
            distance,
            col: Math.floor((d.x - offsetX) / (squareSize + gap)),
            row: Math.floor((d.y - offsetY) / (squareSize + gap))
          }
        }
      })

      // Update all squares
      squares.each(function(d: any) {
        const square = d3.select(this)
        const centerX = d.x + squareSize/2
        const centerY = d.y + squareSize/2
        
        const distance = Math.sqrt(
          Math.pow(mouseX - centerX, 2) + 
          Math.pow(mouseY - centerY, 2)
        )

        if (distance < maxDistance) {
          d.hasBeenHovered = true
          d.hoverScale = 1 + (maxScale - 1) * (1 - distance/maxDistance)  // Store hover scale
          square.attr('stroke', square.node() === currentClosestSquare?.square.node() ? '#ff0000' : d.strokeColor || getRandomToxicGreen())
        } else {
          d.hoverScale = 1  // Reset hover scale
          square.attr('stroke', d.strokeColor || getRandomToxicGreen())
        }
      })
    }

    // Add click handler to delete closest square
    svg.on('click', () => {
      if (currentClosestSquare) {
        gridMap[currentClosestSquare.row][currentClosestSquare.col] = false
        currentClosestSquare.square
          .style('transform', 'scale(0)')
          .style('opacity', '0')
          .transition()
          .duration(300)
          .remove()
        currentClosestSquare = null
      }
    })

    // Handle window resize
    const handleResize = () => {
      svg.selectAll('rect').remove()
      updateGrid()
    }

    // Add mouse move handler (remove duplicate)
    svg.on('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    // Start roaming movement with slightly different speeds for each square
    const moveInterval = setInterval(moveRoamingSquares, 200)

    return () => {
      clearInterval(moveInterval)
      window.removeEventListener('resize', handleResize)
      svg.on('mousemove', null)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <main style={{ 
      width: '100%', 
      height: '100%', 
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <svg ref={svgRef}></svg>
    </main>
  )
} 