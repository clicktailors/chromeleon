import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create a resized version using Sharp
async function createResizedIcon(sourcePath, targetPath, size) {
	try {
		console.log(`🔄 Processing ${sourcePath} to ${size}x${size}...`);
		
		// Get original file info
		const originalStats = fs.statSync(sourcePath);
		console.log(`📊 Original file size: ${originalStats.size} bytes`);
		
		await sharp(sourcePath)
			.resize(size, size, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
			})
			.png()
			.toFile(targetPath);
		
		// Get output file info
		const outputStats = fs.statSync(targetPath);
		console.log(`📊 Output file size: ${outputStats.size} bytes`);
		
		console.log(`✅ Created ${targetPath} (${size}x${size})`);
	} catch (error) {
		console.error(`❌ Error creating ${targetPath}:`, error.message);
	}
}

// Main function
async function generateIcons() {
	const iconSizes = [16, 32, 48, 128];
	
	// Define possible source files in order of preference
	const possibleSources = [
		path.join(__dirname, '../icons/icon128.png'),
		path.join(__dirname, '../public/icon.svg'),
		path.join(__dirname, '../src/icons/chameleon1.png'),
		path.join(__dirname, '../src/icons/chameleon2.png'),
		path.join(__dirname, '../src/icons/chameleon3.png'),
		path.join(__dirname, '../src/icons/chameleon4.png')
	];
	
	// Find the first available source
	let sourcePath = null;
	for (const source of possibleSources) {
		if (fs.existsSync(source)) {
			sourcePath = source;
			console.log(`📁 Using source: ${source}`);
			break;
		}
	}
	
	if (!sourcePath) {
		console.error('❌ No source icon found! Please ensure one of the following exists:');
		console.error('   - public/icon.svg');
		console.error('   - icons/icon128.png');
		console.error('   - src/icons/chameleon*.png');
		process.exit(1);
	}
	
	// Define icon variants (currently just the main icon, but supports future grayed-out version)
	const iconVariants = [
		{ name: '', source: sourcePath }
	];
	
	// Optional: Add grayed-out variant if it exists
	const graySource = path.join(__dirname, '../icons/icon128_gray.png');
	if (fs.existsSync(graySource)) {
		iconVariants.push({ name: '_gray', source: graySource });
		console.log('🎨 Found grayed-out icon variant');
	}
	
	// Create output directories if they don't exist
	const outputDirs = [
		path.join(__dirname, '../public'),
		path.join(__dirname, '../dist')
	];
	
	for (const dir of outputDirs) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`📁 Created directory: ${dir}`);
		}
	}
	
	// Generate icons for each variant
	for (const variant of iconVariants) {
		console.log(`\n🔄 Generating icons from ${variant.source}...`);
		
		for (const size of iconSizes) {
			// Generate for both public and dist directories
			const publicTargetPath = path.join(__dirname, '../public', `icon${size}${variant.name}.png`);
			const distTargetPath = path.join(__dirname, '../dist', `icon${size}${variant.name}.png`);
			
			await createResizedIcon(variant.source, publicTargetPath, size);
			await createResizedIcon(variant.source, distTargetPath, size);
		}
	}
	
	console.log('\n🎉 Icon generation complete!');
	console.log('📁 Icons saved to: public/ and dist/');
	console.log('🔧 Run "npm run build:extension" to include them in your extension');
	
	// Show summary of generated files
	console.log('\n📋 Generated files:');
	for (const variant of iconVariants) {
		for (const size of iconSizes) {
			console.log(`   - icon${size}${variant.name}.png`);
		}
	}
}

// Run the script
generateIcons().catch(console.error); 