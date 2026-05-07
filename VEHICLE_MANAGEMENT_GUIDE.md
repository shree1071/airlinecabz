# 🚗 Vehicle Management System - User Guide

## Overview
The Vehicle Management System allows admins to easily manage the fleet without any coding knowledge.

## Features

### ✨ Key Capabilities
- **Add New Vehicles** - Add any vehicle with custom pricing
- **Edit Existing Vehicles** - Update prices, capacity, or any detail
- **Delete Vehicles** - Remove vehicles from the fleet
- **Toggle Active/Inactive** - Quickly enable/disable vehicles
- **Search & Filter** - Find vehicles by name, capacity, or category
- **Real-time Stats** - See total vehicles, active count, and category breakdown

### 🎨 Visual Improvements
- Modern gradient design
- Smooth animations and transitions
- Toast notifications for all actions
- Loading states for better UX
- Responsive design for mobile/tablet/desktop
- Color-coded categories (Airport=Purple, Outstation=Orange, Local=Blue)

### 🛡️ Bug Fixes & Validations
- Form validation with error messages
- Prevents duplicate slugs
- Requires either base fare or per km rate
- Auto-generates URL-friendly slugs
- Confirmation dialogs for deletions
- Prevents double submissions
- Error handling for API failures

## How to Use

### Adding a Vehicle
1. Click "Add Vehicle" button (top right)
2. Fill in the form:
   - **Vehicle Name**: e.g., "Toyota Innova Crysta"
   - **Category**: Airport, Outstation, or Local
   - **Base Fare**: Fixed price (₹)
   - **Per KM Rate**: Price per kilometer (₹)
   - **Capacity**: e.g., "7+1"
   - **Image URL**: Path to vehicle image (e.g., `/imgi_9_innova.png`)
   - **EV**: Check if electric vehicle
   - **Active**: Check to make visible to customers
3. Click "Add Vehicle"

### Editing a Vehicle
1. Find the vehicle card
2. Click "Edit" button
3. Update any fields
4. Click "Update Vehicle"

### Deleting a Vehicle
1. Find the vehicle card
2. Click the delete button (trash icon)
3. Confirm deletion

### Quick Toggle Active/Inactive
- Click the "Active" or "Inactive" badge on any vehicle card
- Vehicle status updates immediately

### Filtering & Search
- Use category tabs to filter: All, Airport, Outstation, Local
- Use search bar to find by name or capacity
- Results update in real-time

## Pricing Examples

### Airport Vehicles
- **Base Fare**: ₹799-4999
- **Per KM**: Usually ₹0 (flat rate)

### Outstation Vehicles
- **Base Fare**: ₹0
- **Per KM**: ₹12-42 (distance-based)

### Local Vehicles
- **Base Fare**: ₹1300-7999 (4hr/8hr packages)
- **Per KM**: ₹0 or small rate

## Tips
- Upload vehicle images to `/public` folder first
- Use descriptive names for better SEO
- Keep capacity format consistent (e.g., "7+1")
- Mark vehicles as inactive instead of deleting (preserves booking history)
- Use EV badge for electric vehicles to attract eco-conscious customers

## Access
Navigate to: `/admin/vehicles` or click "Manage Vehicles" from admin dashboard

## Support
For issues or questions, contact the development team.
